#!/usr/bin/env python3
"""Convert vanilla M2/BLP art into the simulator's small browser asset format.

Run with Python + Pillow. --source accepts an extracted client directory or an
HTTP data root. Only assets explicitly listed in catalog.json are imported.
The runtime uses the checked-in conversions and makes no third-party requests.
"""
import argparse
import hashlib
import io
import json
import math
from pathlib import Path
import struct
import subprocess
import urllib.parse
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'wow'
CACHE = Path('/tmp/wow-art-source')
SOURCES = {}


def read_asset(name):
    name = name.replace('\\', '/').lower()
    if name.endswith('.mdx'):
        name = name[:-4] + '.m2'
    cache = CACHE / name
    if not cache.exists():
        if SOURCE.startswith(('https://', 'http://')):
            url = SOURCE.rstrip('/') + '/' + urllib.parse.quote(name, safe='/')
            data = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location',
                                   '--max-time', '45', url], check=True, capture_output=True).stdout
        else:
            data = (Path(SOURCE) / name).read_bytes()
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_bytes(data)
    data = cache.read_bytes()
    SOURCES[name] = hashlib.sha256(data).hexdigest()
    return data


def decode_blp(data):
    # Vanilla paletted BLP2 stores alpha after the index plane, not in the
    # palette's reserved byte (which is usually zero).
    if data[:4] == b'BLP2' and data[8] == 1:
        depth = data[9]
        width, height, offset = struct.unpack_from('<III', data, 12)
        count = width * height
        indices = data[offset:offset+count]
        alpha = data[offset+count:]
        pixels = bytearray(count * 4)
        for i, index in enumerate(indices):
            b, g, r, _ = struct.unpack_from('<4B', data, 148 + index * 4)
            a = 255 if depth == 0 else alpha[i] if depth == 8 else ((alpha[i//2] >> (4*(i%2))) & 15) * 17 if depth == 4 else ((alpha[i//8] >> (i%8)) & 1) * 255
            pixels[i*4:i*4+4] = bytes((r,g,b,a))
        return Image.frombytes('RGBA', (width,height), bytes(pixels))
    return Image.open(io.BytesIO(data)).convert('RGBA')


def texture(name):
    key = hashlib.sha256(name.lower().encode()).hexdigest()[:16]
    dest = OUT / 'textures' / (key + '.png')
    im = decode_blp(read_asset(name))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, optimize=True)
    return 'textures/' + dest.name


def round_floats(value):
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError('non-finite asset value')
        return round(value, 6)
    if isinstance(value, list):
        return [round_floats(x) for x in value]
    if isinstance(value, dict):
        return {k: round_floats(v) for k, v in value.items()}
    return value


def convert_model(key, cfg):
    data = read_asset(cfg['model'])
    def rd(fmt, offset):
        return struct.unpack_from('<' + fmt, data, offset)
    def arr(offset):
        return rd('II', offset)
    if data[:4] != b'MD20' or rd('I', 4)[0] != 256:
        raise ValueError('Only vanilla MD20 version 256 is supported')
    vn, vo = arr(0x44)
    _, view = arr(0x4c)
    ni, oi = arr(view)
    nt, ot = arr(view + 8)
    ns, os = arr(view + 24)
    nb, ob = arr(view + 32)
    lookup = rd('H' * ni, oi)
    triangles = [lookup[i] for i in rd('H' * nt, ot)]
    sections = [dict(id=rd('H', os + i * 32)[0], start=rd('H', os + i * 32 + 8)[0], count=rd('H', os + i * 32 + 10)[0]) for i in range(ns)]
    tn, to = arr(0x5c)
    textures = []
    for i in range(tn):
        kind, flags, length, offset = rd('4I', to + i * 16)
        name = data[offset:offset+length].split(b'\0')[0].decode() if length else ''
        name = cfg.get('skins', {}).get(str(kind), name)
        name = cfg.get('textureOverrides', {}).get(name.replace('\\', '/').lower(), name)
        # Environment-map and unused character texture slots are excluded from draw batches.
        textures.append(dict(kind=kind, flags=flags, image=texture(name) if name else None))
    ln, lo = arr(0x94)
    tl = rd('H' * ln, lo)
    un, uo = arr(0x9c)
    uv_sources = rd('h' * un, uo)
    mn, mo = arr(0x84)
    mats = [rd('HH', mo + i * 4) for i in range(mn)]
    batches = []
    for i in range(nb):
        p = ob + i * 24
        section, material, tx = rd('H', p + 4)[0], rd('H', p + 10)[0], rd('H', p + 16)[0]
        sec = sections[section]
        if cfg.get('geosets') is not None and sec['id'] not in cfg['geosets']:
            continue
        if tx >= len(tl) or not textures[tl[tx]]['image']:
            continue
        flags, blend = mats[material]
        uv_index = rd('H', p + 18)[0]
        batch = dict(start=sec['start'], count=sec['count'], texture=tl[tx], flags=flags, blend=blend,
                     environment=uv_index < len(uv_sources) and uv_sources[uv_index] < 0)
        if batch not in batches:
            batches.append(batch)
    bn, bo = arr(0x34)
    bones = [dict(parent=rd('h', bo + i * 108 + 8)[0], flags=rd('I', bo + i * 108 + 4)[0], pivot=list(rd('3f', bo + i * 108 + 96))) for i in range(bn)]
    gn, go = arr(0x14)
    globals_ = list(rd('I' * gn, go))
    def channel(offset, dim, slot, start, end):
        interp, global_id = rd('HH', offset)
        rn, ro = arr(offset + 4)
        tn, to = arr(offset + 12)
        kn, ko = arr(offset + 20)
        n = min(tn, kn)
        if not n:
            return None
        times = list(rd('I' * n, to))
        values = [list(rd('f' * dim, ko + i * dim * 4)) for i in range(n)]
        if global_id != 65535:
            period = globals_[global_id] if global_id < len(globals_) else 0
            keep = list(range(n)) if period else [0]
            ts = [times[i] for i in keep]
        else:
            period = 0
            keep = [i for i,t in enumerate(times) if start <= t <= end]
            if not keep:
                lo, hi = rd('II', ro + min(slot,rn-1)*8) if rn else (0,n-1)
                keep = [min(lo,n-1)]
            ts = [max(0,min(end-start,times[i]-start)) for i in keep]
        vs = [values[i] for i in keep]
        if all(v == vs[0] for v in vs):
            ts,vs = [0],[vs[0]]
        return dict(times=ts, values=vs, step=interp == 0, period=period)
    an, ao = arr(0x1c)
    clips = {}
    # AnimationData.dbc: stand/death, locomotion, attacks, casting, jump and flight.
    wanted = {0,1,2,4,5,8,16,17,26,31,32,37,38,39,51,52,53,54,74,135,183,184,193}
    for slot in range(an):
        p = ao + slot * 68
        aid = rd('H',p)[0]
        start,end = rd('II',p+4)
        if aid not in wanted or str(aid) in clips or end <= start:
            continue
        tracks = []
        for i in range(bn):
            p = bo + i * 108
            tracks.append([channel(p+12,3,slot,start,end),channel(p+40,4,slot,start,end),channel(p+68,3,slot,start,end)])
        clips[str(aid)] = dict(duration=end-start, tracks=tracks)
    if not clips:
        clips['0'] = dict(duration=1000, tracks=[[None,None,None] for _ in bones])
    attachments = {}
    na, oa = arr(0x104)
    for i in range(na):
        p=oa+i*48
        aid,bone=rd('II',p)
        if str(aid) not in attachments and bone < bn:
            attachments[str(aid)] = dict(bone=bone, position=list(rd('3f',p+8)))
    positions = [rd('3f',vo+i*48) for i in range(vn)]
    bounds = [[min(p[j] for p in positions) for j in range(3)],[max(p[j] for p in positions) for j in range(3)]]
    mesh = bytearray(struct.pack('<I',vn))
    for i in range(vn): mesh += data[vo+i*48:vo+i*48+40]
    mesh += struct.pack('<I',nt) + struct.pack('<'+'H'*nt,*triangles)
    dest = OUT / 'models' / key
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.with_suffix('.bin').write_bytes(mesh)
    meta = dict(version=1, vertexCount=vn, indexCount=nt, batches=batches, textures=textures, bones=bones, clips=clips, attachments=attachments, bounds=bounds)
    dest.with_suffix('.json').write_text(json.dumps(round_floats(meta),separators=(',',':')))
    print(f'{key}: {vn} vertices, {nt//3} triangles, {bn} bones, {len(clips)} clips',flush=True)
    return {'model':'models/'+key+'.json', 'scale':cfg.get('scale',1), **{k:cfg[k] for k in ('equipment','flipZ') if k in cfg}}


def character_atlas(key, config):
    base = decode_blp(read_asset('Character/Human/Male/HumanMaleSkin00_00.blp')).resize((256,256))
    regions={'AU':(0,0,128,64),'AL':(0,64,128,64),'HA':(0,128,128,32),'TU':(128,0,128,64),'TL':(128,64,128,32),'LU':(128,96,128,64),'LL':(128,160,128,64),'FO':(128,224,128,32)}
    for region,name in config.items():
        x,y,w,h=regions[region]
        part=decode_blp(read_asset(name)).resize((w,h))
        base.alpha_composite(part,(x,y))
    dest=OUT/'textures'/('character-'+key+'.png')
    dest.parent.mkdir(parents=True,exist_ok=True)
    base.save(dest,optimize=True)
    return 'textures/'+dest.name


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True)
    parser.add_argument('--only',help='Comma separated model keys, for incremental imports')
    args=parser.parse_args(); SOURCE=args.source
    catalog=json.loads((ROOT/'tools/art/catalog.json').read_text())
    manifest_path=OUT/'manifest.json'
    manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {'models':{},'surfaces':{},'icons':{}}
    chosen=set(args.only.split(',')) if args.only else None
    for key,cfg in catalog['models'].items():
        if chosen and key not in chosen: continue
        manifest['models'][key]=convert_model(key,cfg)
        if cfg.get('atlas'):
            atlas=character_atlas(key,cfg['atlas'])
            path=OUT/manifest['models'][key]['model']; meta=json.loads(path.read_text())
            for t in meta['textures']:
                if t['kind']==1: t['image']=atlas
            path.write_text(json.dumps(meta,separators=(',',':')))
    if not chosen:
        for section in ('surfaces','icons'):
            for key,path in catalog.get(section,{}).items():
                manifest[section][key]=texture(path)
                print(section,key,flush=True)
    OUT.mkdir(parents=True,exist_ok=True)
    manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    provenance=OUT/'sources.json'
    old=json.loads(provenance.read_text()) if provenance.exists() else {}
    old.update(SOURCES);provenance.write_text(json.dumps(old,indent=2,sort_keys=True)+'\n')
