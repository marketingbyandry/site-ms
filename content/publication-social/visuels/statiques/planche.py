import sys,glob,os
from PIL import Image
o=sys.argv[1]; fs=[]
for a in sys.argv[2:]: fs+=sorted(glob.glob(a))
w=216;h=270;c=9;r=-(-len(fs)//c); s=Image.new("RGB",(c*w,r*h),"#888")
for i,f in enumerate(fs):
    im=Image.open(f); im.thumbnail((w-6,h-6)); s.paste(im,(i%c*w,i//c*h))
s.save(o,quality=88); print(len(fs))
