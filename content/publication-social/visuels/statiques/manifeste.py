import os,re,json,glob
F={"panorama":[8,12,14,15,24,33,36,47,52,54,59,61,63,64,68],"objet":[26,28,29,31,35,49,56,71,75],"ticket":[1,5,17,19,21,22,45,50,57,66,70,73,77]}
import datetime
V=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));R={}
src=open(os.path.join(V,"statiques/build.py")).read()
for n in map(int,re.findall(r"@jour\((\d+)\)",src)):
    d=str(datetime.date(2026,10,15)+datetime.timedelta(n-1)); g=lambda p:["visuels/"+d+"/"+os.path.basename(f) for f in sorted(glob.glob(f"{V}/{d}/j{n}_{p}"))]
    R[f"J{n}"]={"date":d,"format_carrousel":next((k for k,v in F.items() if n in v),None),"medias":{k:v for k,v in {"ig":g("ig_*.jpg")+g("instagram.jpg"),"fb":g("facebook.jpg"),"x":g("x.jpg"),"li":g("linkedin.*")}.items() if v}}
json.dump({"lot":"Statiques manquants J1-J78","statut":"a_valider","elevenlabs_credits":0,"replis":"Photos réelles et clips des briefs remplacés par des illustrations (J1-J12 : seul LinkedIn manquait)","alertes":["J29 et J75 : les textes disent « depuis le 1er février 2026 », le visuel dit 1er août 2026","J36 : août absent du baromètre, dernière valeur septembre 2026","J56 : texte X à revoir, mécanisme de capacité modifié le 01/11/2026"],"jours":R},open(os.path.join(V,"..","lot-statiques.json"),"w"),ensure_ascii=False,indent=1)
m=[sum(len(x) for x in r["medias"].values()) for r in R.values()];print(len(R),sum(m),[k for k,r in R.items() if not r["medias"]])
