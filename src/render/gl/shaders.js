// GLSL for the world. Everything is hand-written WebGL2: skinned lit models,
// textured environment, floor telegraphs, instanced particles and post.

export const MAX_BONES = 72;
export const MAX_LIGHTS = 12;

const HEAD = `#version 300 es
precision highp float;
precision highp int;
`;

const NOISE = `
float h31(vec3 p){ p=fract(p*vec3(.1031,.1030,.0973)); p+=dot(p,p.yxz+33.33); return fract((p.x+p.y)*p.z); }
float vn3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm3(vec3 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vn3(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s/.9375; }
vec2 voro3(vec3 x){ vec3 n=floor(x), f=fract(x); float F1=8., F2=8.;
 for(int k=-1;k<=1;k++)for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){ vec3 g=vec3(i,j,k);
  vec3 o=vec3(h31(n+g),h31(n+g+11.3),h31(n+g+27.1)); vec3 r=g+o-f; float d=dot(r,r);
  if(d<F1){F2=F1;F1=d;} else if(d<F2){F2=d;} }
 return vec2(sqrt(F1),sqrt(F2)-sqrt(F1)); }
`;

const LIGHTING = `
uniform vec3 uCam, uAmbUp, uAmbDown, uKeyDir, uKeyCol, uFog;
uniform float uFogD, uTime;
uniform vec4 uLP[${MAX_LIGHTS}];
uniform vec3 uLC[${MAX_LIGHTS}];
uniform int uLN;
vec3 lightAll(vec3 P, vec3 N, vec3 alb, float gloss, float rim){
  vec3 V=normalize(uCam-P);
  float up=N.z*.5+.5;
  vec3 c=alb*mix(uAmbDown,uAmbUp,up);
  float nl=dot(N,uKeyDir);
  float wrap=smoothstep(-.25,.85,nl);
  c+=alb*uKeyCol*wrap;
  vec3 H=normalize(uKeyDir+V);
  c+=uKeyCol*gloss*pow(max(dot(N,H),0.),24.)*.5;
  for(int i=0;i<uLN;i++){
    vec3 L=uLP[i].xyz-P; float d2=dot(L,L); float r=uLP[i].w;
    float att=max(0.,1.-d2/(r*r)); att*=att;
    if(att<=0.) continue;
    L/=sqrt(d2);
    float w=dot(N,L)*.5+.5; w*=w;
    c+=alb*uLC[i]*w*att;
    vec3 H2=normalize(L+V);
    c+=uLC[i]*gloss*pow(max(dot(N,H2),0.),18.)*att*.35;
  }
  float f=pow(1.-max(dot(N,V),0.),3.);
  c+=rim*f*(uAmbUp*1.6+uKeyCol*.25);
  return c;
}
vec3 applyFog(vec3 c, vec3 P){ float d=length(uCam-P)*uFogD; c=mix(c,uFog,1.-exp(-d*d)); if(isnan(c.r+c.g+c.b)||isinf(c.r+c.g+c.b)) c=uFog; return clamp(c,vec3(0.),vec3(40.)); }
`;

export const litVS = HEAD + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec3 aCol;
layout(location=3) in float aEm; layout(location=4) in vec2 aBone; layout(location=5) in float aW;
uniform mat4 uVP, uModel; uniform mat3x4 uBones[${MAX_BONES}];
out vec3 vW, vN, vC, vO; out float vE;
void main(){
  int b0=int(aBone.x+.5), b1=int(aBone.y+.5);
  vec4 p=vec4(aPos,1.);
  vec3 s=mix(p*uBones[b1], p*uBones[b0], aW);
  vec3 n=mix(aNor*mat3(uBones[b1]), aNor*mat3(uBones[b0]), aW);
  vec4 w=uModel*vec4(s,1.);
  vW=w.xyz; vN=normalize(mat3(uModel)*n); vC=aCol; vE=aEm; vO=aPos;
  gl_Position=uVP*w;
}`;

export const litFS = HEAD + NOISE + LIGHTING + `
in vec3 vW, vN, vC, vO; in float vE;
uniform vec4 uMat; // paint mottling, scale pattern, crack glow, rim
uniform vec4 uMat2; // paint frequency, scale frequency, gloss, crack frequency
uniform vec3 uCrack, uTint;
uniform float uFade, uFlash, uEmK, uCutR;
uniform vec4 uCut;
out vec4 frag;
const float B[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
void main(){
  if(uCutR>0.){ vec2 ab=uCut.zw-uCut.xy; float h=clamp(dot(vW.xy-uCut.xy,ab)/dot(ab,ab),0.,1.); if(distance(vW.xy,uCut.xy+ab*h)<uCutR&&h<.98) discard; }
  if(uFade<.995){ ivec2 q=ivec2(gl_FragCoord.xy)%4; if(uFade<(B[q.x+q.y*4]+.5)/16.) discard; }
  vec3 N=normalize(vN);
  if(!gl_FrontFacing) N=-N;
  vec3 alb=pow(vC,vec3(2.2))*uTint;
  float n=fbm3(vO*uMat2.x);
  alb*=1.+uMat.x*(n-.5)*2.2;
  if(uMat.y>0.){
    vec2 v=voro3(vO*uMat2.y);
    float e=smoothstep(.0,.22,v.y);
    alb*=mix(1.,.34+.82*e,uMat.y);
    N=normalize(N+uMat.y*.35*(vec3(fbm3(vO*uMat2.y*2.3),fbm3(vO*uMat2.y*2.3+5.),fbm3(vO*uMat2.y*2.3+9.))-.5));
  }
  vec3 c=lightAll(vW,N,alb,uMat2.z,uMat.w);
  if(uMat.z>0.){
    float f=abs(fbm3(vO*uMat2.w+vec3(0.,0.,uTime*.16))*2.-1.);
    float glow=smoothstep(.055,.0,f);
    float flick=.75+.25*sin(uTime*2.+vO.x*3.+vO.z*2.);
    c+=uCrack*glow*glow*uMat.z*flick;
  }
  c+=pow(vC,vec3(2.2))*vE*(1.5+.35*sin(uTime*3.+vO.z))*uEmK;
  c+=alb*uFlash*2.4;
  frag=vec4(applyFog(c,vW),1.);
}`;

export const assetVS = HEAD + `
layout(location=0) in vec3 aPos; layout(location=1) in vec4 aWeights;
layout(location=2) in vec4 aBones; layout(location=3) in vec3 aNormal; layout(location=4) in vec2 aUV;
uniform mat4 uVP, uModel; uniform highp sampler2D uBones;
out vec3 vW, vN; out vec2 vUV;
mat4 bone(int i){ return mat4(texelFetch(uBones,ivec2(0,i),0),texelFetch(uBones,ivec2(1,i),0),texelFetch(uBones,ivec2(2,i),0),texelFetch(uBones,ivec2(3,i),0)); }
void main(){
  mat4 skin=bone(int(aBones.x))*aWeights.x+bone(int(aBones.y))*aWeights.y+bone(int(aBones.z))*aWeights.z+bone(int(aBones.w))*aWeights.w;
  if(dot(aWeights,vec4(1.))<.01) skin=mat4(1.);
  vec4 world=uModel*skin*vec4(aPos,1.);
  vW=world.xyz; vN=normalize(mat3(uModel)*mat3(skin)*aNormal); vUV=aUV;
  gl_Position=uVP*world;
}`;

export const assetFS = HEAD + LIGHTING + `
in vec3 vW, vN; in vec2 vUV;
uniform sampler2D uTex; uniform int uBlend, uUnlit, uEnvironment; uniform float uFade, uFlash;
out vec4 frag;
const float B[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
void main(){
  if(uFade<.995){ ivec2 q=ivec2(gl_FragCoord.xy)%4; if(uFade<(B[q.x+q.y*4]+.5)/16.) discard; }
  vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N;
  vec2 uv=uEnvironment==1 ? reflect(normalize(vW-uCam),N).xy*.5+.5 : vUV;
  vec4 tex=texture(uTex,uv);
  if(uBlend==1 && tex.a<.5) discard;
  vec3 alb=pow(tex.rgb,vec3(2.2));
  // The painted texture carries most of the shading, as in the Classic client.
  vec3 lit=uUnlit==1 ? alb : lightAll(vW,N,alb,.025,.025)+alb*.24;
  frag=vec4(applyFog(lit+alb*uFlash,vW),uBlend>=2 ? tex.a : 1.);
}`;

export const envVS = HEAD + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec2 aUV; layout(location=3) in vec3 aCol;
uniform mat4 uVP;
out vec3 vW, vN, vC; out vec2 vUV;
void main(){ vW=aPos; vN=aNor; vUV=aUV; vC=aCol; gl_Position=uVP*vec4(aPos,1.); }`;

export const envFS = HEAD + NOISE + LIGHTING + `
in vec3 vW, vN, vC; in vec2 vUV;
uniform sampler2D uTex;
uniform float uBump, uGloss;
uniform int uMode;  // 0 stone, 1 lava, 2 dome, 3 water
uniform vec3 uGlowA, uGlowB;
out vec4 frag;
vec3 bumped(vec3 N, float h, float amt){
  vec3 dx=dFdx(vW), dy=dFdy(vW); float hx=dFdx(h), hy=dFdy(h);
  vec3 r1=cross(dy,N), r2=cross(N,dx); float det=dot(dx,r1);
  vec3 g=sign(det)*(hx*r1+hy*r2);
  return normalize(abs(det)*N-amt*g);
}
vec3 lava(vec2 p){
  float t=uTime;
  vec2 q=p+vec2(t*.07,t*.05);
  float cells=fbm3(vec3(q*.42,t*.05));
  float crust=smoothstep(.3,.47,fbm3(vec3(q*.9+cells*1.6,t*.04)));
  float hot=pow(1.-crust,2.2);
  float flare=fbm3(vec3(p*1.7-q*.2,t*.3));
  vec3 c=mix(uGlowA*.5,uGlowB,smoothstep(.3,1.05,hot+flare*.35));
  return mix(c*(.6+hot*.55), vec3(.045,.02,.016)+uGlowA*.05, crust);
}
void main(){
  vec3 N=normalize(vN), c;
  if(uMode==1){
    c=lava(vW.xy);
  } else if(uMode==2){
    vec4 t=texture(uTex,vUV);
    vec3 alb=pow(t.rgb,vec3(2.2))*vC;
    c=lightAll(vW,N,alb,0.,0.);
    float v=fbm3(vW*.05+vec3(uTime*.012,0.,0.));
    float vein=smoothstep(.009,.0,abs(v-.5))*smoothstep(.5,.62,fbm3(vW*.021+7.));
    c+=uGlowA*vein*uGloss;
  } else if(uMode==3){
    float t=uTime*.3;
    float w=fbm3(vec3(vW.xy*.6+t,t));
    vec3 n=normalize(N+vec3(dFdx(w)*30.,dFdy(w)*30.,0.));
    vec3 V=normalize(uCam-vW);
    c=mix(uGlowA,uGlowB,w)*(.5+.6*pow(1.-max(dot(n,V),0.),3.));
    c+=uKeyCol*pow(max(dot(reflect(-uKeyDir,n),V),0.),60.)*.8;
  } else {
    vec4 t=texture(uTex,vUV);
    vec3 alb=pow(t.rgb,vec3(2.2))*vC;
    float m=fbm3(vec3(vW.xy*.05,vW.z*.1));
    alb*=.72+.56*m;
    N=bumped(N,t.a,uBump);
    c=lightAll(vW,N,alb,uGloss*t.a,0.);
  }
  frag=vec4(applyFog(c,vW),1.);
}`;

export const decalVS = HEAD + `
layout(location=0) in vec3 aPos; layout(location=1) in vec4 aCol; layout(location=2) in vec3 aData;
uniform mat4 uVP;
out vec4 vC; out vec3 vD; out vec3 vW;
void main(){ vC=aCol; vD=aData; vW=aPos; gl_Position=uVP*vec4(aPos,1.); }`;

export const decalFS = HEAD + NOISE + `
in vec4 vC; in vec3 vD; in vec3 vW;
uniform float uTime;
out vec4 frag;
void main(){
  float mode=vD.z, a=vC.a; vec3 c=vC.rgb;
  if(mode>4.5){            // dashed line, vD.x runs along it
    if(fract(vD.x)>.58) discard;
    a*=smoothstep(1.,.55,abs(vD.y));
  } else if(mode>3.5){     // rim glow: vD.y runs 0 at the inside to 1 on the edge
    a*=pow(vD.y,2.4);
    c*=1.+1.2*pow(vD.y,5.);
  } else if(mode>2.5){     // burning fill
    float n=fbm3(vec3(vW.xy*.55,uTime*.9));
    float m=fbm3(vec3(vW.xy*1.5+n,uTime*1.4));
    a*=.45+.75*m;
    c*=.7+1.3*m*n;
  } else if(mode>1.5){     // warning hatch sliding over the floor
    float s=fract((vW.x+vW.y)*.32-uTime*.55);
    a*=.42+.58*smoothstep(.46,.5,s)*smoothstep(1.,.94,s);
  } else if(mode>.5){      // soft-edged line
    a*=smoothstep(1.,.3,abs(vD.y));
  }
  frag=vec4(c*a,a);
}`;

export const particleVS = HEAD + `
layout(location=0) in vec2 aCorner;
layout(location=1) in vec4 iPos;   // xyz, size
layout(location=2) in vec4 iCol;   // premultiplied-ish colour: a=0 additive, a=1 solid
layout(location=3) in vec2 iMisc;  // rotation, kind
uniform mat4 uVP; uniform vec3 uRight, uUp;
out vec2 vUV; out vec4 vC; flat out float vK; out float vSeed;
void main(){
  float c=cos(iMisc.x), s=sin(iMisc.x);
  vec2 q=mat2(c,s,-s,c)*aCorner*iPos.w;
  vec3 w=iPos.xyz+uRight*q.x+uUp*q.y;
  vUV=aCorner; vC=iCol; vK=iMisc.y; vSeed=iPos.x*1.7+iPos.y*.9;
  gl_Position=uVP*vec4(w,1.);
}`;

export const particleFS = HEAD + NOISE + `
in vec2 vUV; in vec4 vC; flat in float vK; in float vSeed;
uniform float uTime;
out vec4 frag;
void main(){
  float r=length(vUV);
  if(r>1.) discard;
  float a;
  if(vK<.5){                 // soft glow
    a=pow(1.-r,2.2);
  } else if(vK<1.5){         // flame licks
    float n=fbm3(vec3(vUV*2.1,uTime*2.2+vSeed));
    a=smoothstep(0.,.9,(1.-r)*(.35+1.5*n));
  } else if(vK<2.5){         // smoke and cloud
    float n=fbm3(vec3(vUV*1.7,uTime*.5+vSeed));
    a=smoothstep(.0,.8,(1.-r)*(.2+1.5*n));
  } else {                   // hard spark
    a=smoothstep(1.,.45,r);
  }
  a=clamp(a,0.,1.); frag=vec4(vC.rgb*a,vC.a*a);
}`;

export const fullVS = HEAD + `
out vec2 vUV;
void main(){ vec2 p=vec2(gl_VertexID==1?3.:-1., gl_VertexID==2?3.:-1.); vUV=p*.5+.5; gl_Position=vec4(p,0.,1.); }`;

export const brightFS = HEAD + `
in vec2 vUV; uniform sampler2D uTex; out vec4 frag;
void main(){ vec3 c=texture(uTex,vUV).rgb; if(isnan(c.r+c.g+c.b)||isinf(c.r+c.g+c.b)) c=vec3(0.); c=min(c,vec3(16.)); float l=max(c.r,max(c.g,c.b)); frag=vec4(c*smoothstep(1.5,4.5,l),1.); }`;

export const blurFS = HEAD + `
in vec2 vUV; uniform sampler2D uTex; uniform vec2 uDir; out vec4 frag;
void main(){
  vec3 c=texture(uTex,vUV).rgb*.227;
  c+=(texture(uTex,vUV+uDir*1.385).rgb+texture(uTex,vUV-uDir*1.385).rgb)*.316;
  c+=(texture(uTex,vUV+uDir*3.231).rgb+texture(uTex,vUV-uDir*3.231).rgb)*.070;
  frag=vec4(c,1.);
}`;

export const compositeFS = HEAD + `
in vec2 vUV;
uniform sampler2D uScene, uB0, uB1, uB2;
uniform vec3 uGrade;
uniform float uVignette, uExposure, uDim;
out vec4 frag;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
void main(){
  vec3 c=texture(uScene,vUV).rgb;
  if(isnan(c.r+c.g+c.b)||isinf(c.r+c.g+c.b)) c=vec3(0.);
  c+=texture(uB0,vUV).rgb*.3+texture(uB1,vUV).rgb*.26+texture(uB2,vUV).rgb*.22;
  c*=uExposure*uGrade;
  c=aces(c);
  vec2 d=vUV-.5;
  c*=1.-uVignette*smoothstep(.25,.85,dot(d,d)*2.2);
  float l=dot(c,vec3(.3,.59,.11));
  c=mix(vec3(l),c,1.14);
  c=pow(max(c,vec3(0.)),vec3(1./2.2));
  frag=vec4(c*uDim,1.);
}`;

// ---- textures painted once on the GPU at load: rgb albedo, a height.
export const bakeFS = HEAD + `
in vec2 vUV;
uniform int uKind;
uniform vec3 uA, uB, uC;
uniform float uSeed;
out vec4 frag;
float hp(vec2 p,float P){ p=mod(p,P); vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)+uSeed*.137); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float vnp(vec2 x,float P){ vec2 i=floor(x),f=fract(x); f=f*f*(3.-2.*f);
 return mix(mix(hp(i,P),hp(i+vec2(1,0),P),f.x),mix(hp(i+vec2(0,1),P),hp(i+vec2(1,1),P),f.x),f.y); }
float fb(vec2 uv,float base,int oct){ float a=.5,s=0.,n=0.,P=base; vec2 p=uv*P;
 for(int i=0;i<oct;i++){ s+=a*vnp(p,P); n+=a; a*=.5; p*=2.; P*=2.; } return s/n; }
vec3 vor(vec2 uv,float N){ vec2 x=uv*N, i=floor(x), f=fract(x); float F1=8.,F2=8.,id=0.;
 for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){ vec2 g=vec2(a,b);
  vec2 o=vec2(hp(i+g,N),hp(i+g+vec2(19.,7.),N)); vec2 r=g+o-f; float d=dot(r,r);
  if(d<F1){F2=F1;F1=d;id=hp(i+g+vec2(3.,31.),N);} else if(d<F2){F2=d;} }
 return vec3(sqrt(F1),sqrt(F2)-sqrt(F1),id); }
void main(){
  vec2 uv=vUV; vec3 col; float h;
  float fine=fb(uv,16.,5), mid=fb(uv,6.,4);
  if(uKind==0){            // cobblestone
    vec2 w=uv+.018*(vec2(fb(uv,9.,3),fb(uv+.3,9.,3))-.5);
    vec3 v=vor(w,11.);
    float stone=smoothstep(.02,.15,v.y);
    float crown=smoothstep(.0,.55,v.y)*(1.-v.x*.55);
    vec3 tint=mix(uA,uB,v.z)*(.72+.6*fine);
    tint=mix(tint,uC,smoothstep(.55,.85,mid)*.34);
    col=mix(uA*.16,tint*(.72+.5*crown),stone);
    h=stone*(.52+.42*crown)+fine*.1;
  } else if(uKind==1){     // cave rock
    float r=1.-abs(fb(uv,5.,5)*2.-1.);
    float strata=fb(uv*vec2(1.,3.),4.,4);
    col=mix(uA,uB,smoothstep(.3,.75,strata))*(.6+.75*fine);
    col=mix(uC*(.5+fine),col,smoothstep(.72,.92,r)*-.0+1.-.85*smoothstep(.9,.99,r));
    h=mix(strata,fine,.4)*(1.-.75*smoothstep(.88,.99,r));
  } else if(uKind==2){     // squared blocks
    vec2 g=vec2(uv.x*6.,uv.y*8.);
    float row=floor(g.y);
    g.x+=mod(row,2.)*.5;
    vec2 cell=fract(g);
    vec2 d=min(cell,1.-cell)*vec2(1.,.75);
    float edge=smoothstep(.015,.07,min(d.x,d.y)+.012*(fine-.5));
    float id=hp(vec2(mod(floor(g.x),6.),mod(row,8.)),17.);
    vec3 b=mix(uA,uB,id)*(.68+.62*fine);
    b=mix(b,uC,smoothstep(.55,.9,mid)*.3);
    float dark=smoothstep(0.,.2,cell.y);
    col=mix(uA*.14,b*(.7+.3*dark),edge);
    h=edge*(.6+.4*fine);
  } else if(uKind==3){     // rippled sand
    float d=fb(uv,3.,3);
    float ripple=sin((uv.y+d*.3)*62.+fine*4.)*.5+.5;
    col=mix(uA,uB,mid)*(.85+.3*fine);
    col=mix(col,uC,ripple*.07+smoothstep(.6,.85,d)*.2);
    h=ripple*.1+d*.72+fine*.12;
  } else if(uKind==4){     // living hive wall
    vec2 w=uv+.05*(vec2(fb(uv,5.,3),fb(uv+.5,5.,3))-.5);
    vec3 v=vor(w,7.);
    float pod=smoothstep(.02,.26,v.y);
    float vein=smoothstep(.06,.0,abs(fb(uv,9.,4)-.5));
    col=mix(uA,uB,v.z*.7+mid*.3)*(.55+.75*pod)*(.75+.5*fine);
    col+=uC*vein*.8;
    h=pod*(1.-v.x*.6)+fine*.15;
  } else if(uKind==5){     // large dressed floor tiles
    vec2 g=uv*4.;
    vec2 cell=fract(g);
    vec2 d=min(cell,1.-cell);
    float edge=smoothstep(.004,.02,min(d.x,d.y)+.012*(fine-.5));
    float id=hp(floor(g),4.);
    vec3 b=mix(uA,uB,id*.6+fine*.4)*(.72+.56*mid);
    float inner=smoothstep(.09,.1,min(d.x,d.y))*smoothstep(.13,.12,min(d.x,d.y));
    b=mix(b,uC,inner*.16);
    b=mix(b,b*.5,smoothstep(.62,.9,fb(uv,8.,4))*.6);
    col=mix(uA*.46,b,edge);
    h=edge*(.68+.24*fine);
  } else {                 // jungle floor
    vec3 v=vor(uv,26.);
    float leaf=smoothstep(.0,.25,v.y);
    col=mix(uA,uB,v.z)*(.6+.5*leaf)*(.7+.6*fine);
    col=mix(col,uC,smoothstep(.5,.72,mid)*.55);
    h=leaf*.5+fine*.4;
  }
  frag=vec4(col,clamp(h,0.,1.));
}`;
