import struct
import unittest
from import_wow import decode_blp


class PaletteAlpha(unittest.TestCase):
    def test_separate_alpha_plane(self):
        # The palette alpha bytes are deliberately zero, as in vanilla files.
        for depth, alpha, expected in [(0,b'', [255,255]),(1,b'\x02',[0,255]),(4,b'\xf3',[51,255]),(8,b'\x40\xff',[64,255])]:
            with self.subTest(depth=depth):
                data=bytearray(1172)
                data[:4]=b'BLP2';data[8]=1;data[9]=depth
                struct.pack_into('<III',data,12,2,1,1172)
                data[148:152]=bytes([10,20,30,0])
                data+=b'\0\0'+alpha
                im=decode_blp(bytes(data))
                self.assertEqual([im.getpixel((i,0))[3] for i in range(2)],expected)
                self.assertEqual(im.getpixel((0,0))[:3],(30,20,10))


if __name__ == '__main__':
    unittest.main()
