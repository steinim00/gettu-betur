# Býr til data/biolisti.json: bíómyndalistarnir tveir (byggt á sönnum atburðum og
# sögufrægustu) með lengd og IMDb-einkunn úr opnu IMDb gagnasöfnunum
# (https://datasets.imdbws.com - title.basics.tsv.gz og title.ratings.tsv.gz).
# Keyrsla: python3 scripts/bua-til-biolista.py <basics.tsv.gz> <ratings.tsv.gz>
import csv, gzip, json, sys

# (enskt nafn / IMDb nafn, ár, íslenskt nafn, lýsing, fólk)
SONN = [
 ("300", 2006, "", "Orrustan um Laugaskarð", "Gerard Butler í sínu frægasta hlutverki"),
 ("A Beautiful Mind", 2001, "", "Stærðfræðingurinn John Nash", "Russell Crowe leikur"),
 ("All the President's Men", 1976, "", "Watergate-hneykslið", "Robert Redford og Dustin Hoffman leika"),
 ("Amadeus", 1984, "", "Tónskáldið Mozart", "Engar stórstjörnur að baki"),
 ("Apollo 13", 1995, "", "„Houston, we have a problem“", "Tom Hanks leikur"),
 ("Chariots of Fire", 1981, "", "Ólympíuleikarnir 1924", "Al Fayed-feðgarnir framleiddu"),
 ("Dunkirk", 2017, "", "Flutningarnir frá Dunkirk í seinni heimsstyrjöld", "Christopher Nolan leikstýrir"),
 ("Evita", 1996, "", "Eva Perón - þjóðargersemi Argentínu", "Madonna leikur"),
 ("Frida", 2002, "", "Frida Kahlo - mexíkóski málarinn", "Salma Hayek leikur"),
 ("Frost/Nixon", 2008, "", "Frægt sjónvarpsviðtal við Nixon", "Ron Howard leikstýrir"),
 ("Gandhi", 1982, "", "Líf Mahatma Gandhi", "Ben Kingsley leikur og Richard Attenborough leikstýrir"),
 ("The Iron Lady", 2011, "", "Forsætisráðherrann Margaret Thatcher", "Meryl Streep leikur"),
 ("The Last King of Scotland", 2006, "", "Idi Amin - einræðisherra Úganda", "Forest Whitaker og Gillian Anderson leika"),
 ("Lincoln", 2012, "", "Abraham Lincoln", "Daniel Day-Lewis leikur og Steven Spielberg leikstýrir"),
 ("Malcolm X", 1992, "", "Malcolm X", "Denzel Washington leikur og Spike Lee leikstýrir"),
 ("Mandela: Long Walk to Freedom", 2013, "", "Líf Nelson Mandela", "Idris Elba leikur"),
 ("Munich: The Edge of War", 2021, "", "Munchen-samkomulagið", "Engar stórstjörnur að baki"),
 ("Oppenheimer", 2023, "", "Manhattan-verkefnið", "Christopher Nolan leikstýrir"),
 ("Seven Years in Tibet", 1997, "", "Ungi Dalai Lama", "Brad Pitt leikur"),
 ("Sully", 2016, "", "Frægt flugslys sem enginn dó í", "Tom Hanks leikur og Clint Eastwood leikstýrir"),
 ("Battle of the Sexes", 2017, "", "Fræg tennisviðureign", "Emma Stone og Steve Carell leika"),
 ("The Imitation Game", 2014, "", "Alan Turing og Enigma", "Benedict Cumberbatch leikur"),
 ("The Theory of Everything", 2014, "", "Líf Stephen Hawking", "Eddie Redmayne leikur, tónlist eftir Jóhann Jóhannsson"),
]

# Úr skjalinu "61 áhrifamestu kvikmyndir sögunnar" (Gettu betur 2018) - Gandhi er
# í hinum flokknum. (IMDb nöfn til samanburðar gætu verið fleiri en eitt, aðskilin með |)
SOGU = [
 ("The Birth of a Nation", 1915, "", "Ein merkasta varða kvikmyndasögunnar og jafnframt ein sú umdeildasta. Endurvakti KKK.", "D.W. Griffith"),
 ("Bronenosets Potemkin|Battleship Potemkin", 1925, "Beitiskipið Potemkin", "Áróðursmynd um uppreisn sjóliða 1905. Frægar Odessa-þrepin.", "Sergei Eisenstein"),
 ("The General", 1926, "", "Ein áhrifamesta gamanmynd sögunnar, byggð lauslega á sönnum atburði úr Þrælastríðinu.", "Buster Keaton"),
 ("The Jazz Singer", 1927, "", "Fyrsta talmyndin í fullri lengd.", "Al Jolson"),
 ("Metropolis", 1927, "", "Fyrsta eiginlega vísindaskáldsögumyndin, í expressjónískum stíl.", "Fritz Lang"),
 ("Steamboat Willie", 1928, "", "Fyrsta myndin með Mikka mús og ein fyrsta teiknimyndin með hljóði.", "Walt Disney og Ub Iwerks"),
 ("Un chien andalou", 1929, "Andalúsíuhundurinn", "Tilraunakennd súrrealísk stuttmynd.", "Luis Bunuel og Salvador Dalí"),
 ("Dracula", 1931, "Drakúla", "Hrollvekjan sem gerði Bela Lugosi heimsfrægan.", "Tod Browning"),
 ("City Lights", 1931, "Borgarljós", "Þöglumynd Chaplins um flækinginn og blindu stúlkuna.", "Charlie Chaplin"),
 ("King Kong", 1933, "", "Frumkvöðull í stop-motion tækni.", "Merian C. Cooper og Ernest B. Schoedsack"),
 ("It Happened One Night", 1934, "", "Fyrsta myndin til að vinna alslemmu á Óskarnum.", "Frank Capra"),
 ("Triumph des Willens|Triumph of the Will", 1935, "Sigur viljans", "Frægasta áróðursmynd allra tíma, um flokksþing nasista 1934.", "Leni Riefenstahl"),
 ("Modern Times", 1936, "", "Chaplin sem flækingurinn í síðasta sinn - ádeila á iðnvæðingu.", "Charlie Chaplin"),
 ("Snow White and the Seven Dwarfs", 1937, "Mjallhvít og dvergarnir sjö", "Fyrsta teiknimynd Disney í fullri lengd.", "Walt Disney"),
 ("The Wizard of Oz", 1939, "Galdrakarlinn í Oz", "Lagið Over the Rainbow sló í gegn.", "Victor Fleming; Judy Garland"),
 ("Gone with the Wind", 1939, "Á hverfanda hveli", "Hattie McDaniel varð fyrst svartra til að vinna Óskar.", "Victor Fleming; Vivien Leigh og Clark Gable"),
 ("Mr. Smith Goes to Washington", 1939, "", "Nýr öldungadeildarþingmaður berst gegn spillingu.", "Frank Capra; James Stewart"),
 ("The Great Dictator", 1940, "Einræðisherrann", "Chaplin gerir grín að Hitler og Mussolini.", "Charlie Chaplin"),
 ("Fantasia", 1940, "", "Teiknimynd við sígilda tónlist.", "Walt Disney"),
 ("Citizen Kane", 1941, "", "Oft talin besta mynd sögunnar. Rosebud.", "Orson Welles"),
 ("Casablanca", 1942, "", "Seinni heimsstyrjöld, ást og „Play it, Sam“.", "Michael Curtiz; Humphrey Bogart og Ingrid Bergman"),
 ("Sunset Blvd.|Sunset Boulevard", 1950, "", "Film noir um gleymda stjörnu þöglumyndanna.", "Billy Wilder"),
 ("Shichinin no samurai|Seven Samurai", 1954, "Sjö samúræjar", "Innblástur The Magnificent Seven.", "Akira Kurosawa"),
 ("Rear Window", 1954, "", "Ljósmyndari í hjólastól sannfærist um morð í næsta húsi.", "Alfred Hitchcock; James Stewart og Grace Kelly"),
 ("Rebel Without a Cause", 1955, "", "Fyrsta stóra myndin um unglinga. James Dean lést fyrir frumsýningu.", "Nicholas Ray; James Dean"),
 ("The Ten Commandments", 1956, "Boðorðin 10", "Móses og brottförin frá Egyptalandi.", "Cecil B. DeMille; Charlton Heston"),
 ("Det sjunde inseglet|The Seventh Seal", 1957, "Sjöunda innsiglið", "Riddari teflir skák við dauðann á tímum Svarta dauða.", "Ingmar Bergman"),
 ("The Bridge on the River Kwai", 1957, "", "Stríðsfangar byggja járnbrautarbrú fyrir Japana.", "David Lean; Alec Guinness"),
 ("Vertigo", 1958, "", "Lögga með lofthræðslu og dularfull kona.", "Alfred Hitchcock; James Stewart"),
 ("Ben-Hur", 1959, "Ben-Húr", "11 Óskarsverðlaun og frægur kappakstur á stríðskerrum.", "William Wyler; Charlton Heston"),
 ("La dolce vita", 1960, "Hið ljúfa líf", "Þaðan kemur orðið „paparazzi“.", "Federico Fellini"),
 ("Psycho", 1960, "", "Sturtuatriðið er eitt það frægasta í sögunni.", "Alfred Hitchcock"),
 ("Dr. No", 1962, "", "Fyrsta James Bond myndin.", "Terence Young; Sean Connery"),
 ("Lawrence of Arabia", 1962, "Arabíu-Lawrence", "Epísk saga T.E. Lawrence í fyrri heimsstyrjöld.", "David Lean; Peter O'Toole"),
 ("Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb", 1964, "Dr. Strangelove", "Svört kómedía um kalda stríðið.", "Stanley Kubrick; Peter Sellers"),
 ("Il buono, il brutto, il cattivo|The Good, the Bad and the Ugly", 1966, "", "Spaghettívestri með tónlist eftir Ennio Morricone.", "Sergio Leone; Clint Eastwood"),
 ("Guess Who's Coming to Dinner", 1967, "", "Braut blað með því að sýna samband fólks af ólíkum uppruna í jákvæðu ljósi.", "Stanley Kramer; Sidney Poitier"),
 ("2001: A Space Odyssey", 1968, "", "Tölvan HAL 9000 og dularfullu steindrangarnir.", "Stanley Kubrick"),
 ("Easy Rider", 1969, "", "Tákn mótmenningar hippatímans.", "Dennis Hopper; Peter Fonda"),
 ("A Clockwork Orange", 1971, "", "Dystópísk framtíð, ofbeldi og Beethoven.", "Stanley Kubrick; Malcolm McDowell"),
 ("The Godfather", 1972, "Guðfaðirinn", "Mafíufjölskyldan Corleone.", "Francis Ford Coppola; Marlon Brando og Al Pacino"),
 ("Deliverance", 1972, "", "Fjórir menn á ferðalagi um Georgíu. Banjó-einvígið.", "John Boorman"),
 ("Jaws", 1975, "", "Fyrsta „blockbuster“-myndin, risahákarl við Amity Island.", "Steven Spielberg"),
 ("One Flew Over the Cuckoo's Nest", 1975, "", "Önnur myndin til að vinna alslemmu á Óskarnum.", "Milos Forman; Jack Nicholson"),
 ("Taxi Driver", 1976, "", "Uppgjafahermaður sem leigubílstjóri í New York.", "Martin Scorsese; Robert De Niro"),
 ("Star Wars", 1977, "Stjörnustríð", "George Lucas lagði grunn að geimóperunni.", "George Lucas"),
 ("Apocalypse Now", 1979, "", "Víetnamstríðið, byggð lauslega á Heart of Darkness.", "Francis Ford Coppola; Marlon Brando"),
 ("The Shining", 1980, "", "Hótelið, „Here's Johnny!“ og REDRUM.", "Stanley Kubrick; Jack Nicholson"),
 ("Raiders of the Lost Ark", 1981, "Indiana Jones", "Fyrsta Indiana Jones myndin - leitin að sáttmálsörkinni.", "Steven Spielberg; Harrison Ford"),
 ("E.T. the Extra-Terrestrial", 1982, "", "„E.T. phone home“. Tekjuhæst þar til Jurassic Park kom.", "Steven Spielberg"),
 ("Gandhi", 1982, "", "Ævi og störf indversku frelsishetjunnar Mahatma Gandhi. 8 Óskarsverðlaun.", "Richard Attenborough; Ben Kingsley"),
 ("The Silence of the Lambs", 1991, "", "Þriðja myndin til að vinna alslemmu á Óskarnum.", "Jonathan Demme; Jodie Foster og Anthony Hopkins"),
 ("Jurassic Park", 1993, "", "Brautryðjandi í tölvuteikningum - risaeðlurnar.", "Steven Spielberg"),
 ("Schindler's List", 1993, "", "Svarthvít mynd um Oskar Schindler og gyðinga sem hann bjargaði.", "Steven Spielberg; Liam Neeson"),
 ("Forrest Gump", 1994, "", "Maður sem er viðstaddur frægustu atburði 20. aldar.", "Robert Zemeckis; Tom Hanks"),
 ("Pulp Fiction", 1994, "", "Samtöl og fléttaðar sögur - byltingarkennd frásögn.", "Quentin Tarantino"),
 ("The Shawshank Redemption", 1994, "", "Efst á IMDb listanum frá 2008.", "Frank Darabont; Tim Robbins og Morgan Freeman"),
 ("Titanic", 1997, "", "11 Óskarsverðlaun, jafnaði met Ben-Hur.", "James Cameron; Leonardo DiCaprio og Kate Winslet"),
 ("The Big Lebowski", 1998, "", "Költmynd Coen-bræðra. Kráin í Reykjavík heitir eftir henni.", "Joel og Ethan Coen; Jeff Bridges"),
 ("The Lord of the Rings: The Fellowship of the Ring", 2001, "Hringadróttinssaga", "Fyrsta myndin í þríleik Peter Jackson.", "Peter Jackson"),
 ("Avatar", 2009, "", "Tekjuhæsta mynd sögunnar (2020).", "James Cameron"),
]

basics_path, ratings_path = sys.argv[1], sys.argv[2]
wanted = {}
for flokkur, lst in (("Byggt á sönnum atburðum", SONN), ("Sögufrægustu", SOGU)):
    for nafn, ar, isl, lysing, folk in lst:
        for n in nafn.split("|"):
            wanted.setdefault(n.lower(), []).append((flokkur, nafn, ar))

cand = {}
with gzip.open(basics_path, "rt", encoding="utf8", newline="") as f:
    r = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
    next(r)
    for row in r:
        tc, tt, pt, ot, adult, sy, ey, rt, genres = row
        if tt not in ("movie", "short", "tvMovie"):
            continue
        for t in {pt.lower(), ot.lower()}:
            if t in wanted:
                cand.setdefault(t, []).append((tc, tt, sy, rt, pt))

ids = {c[0] for v in cand.values() for c in v}
ratings = {}
with gzip.open(ratings_path, "rt", encoding="utf8") as f:
    next(f)
    for line in f:
        tc, rating, votes = line.rstrip("\n").split("\t")
        if tc in ids:
            ratings[tc] = (float(rating), int(votes))

out = {"Byggt á sönnum atburðum": [], "Sögufrægustu": []}
manglar = []
for flokkur, lst in (("Byggt á sönnum atburðum", SONN), ("Sögufrægustu", SOGU)):
    for nafn, ar, isl, lysing, folk in lst:
        best = None
        for n in nafn.split("|"):
            for tc, tt, sy, rt, pt in cand.get(n.lower(), []):
                try:
                    y = int(sy)
                except ValueError:
                    continue
                if abs(y - ar) > 1:
                    continue
                votes = ratings.get(tc, (0, 0))[1]
                if not best or votes > best[0]:
                    best = (votes, tc, tt, y, rt, pt)
        titill = nafn.split("|")[-1] if "|" in nafn else nafn
        if not best:
            manglar.append((flokkur, nafn, ar))
            out[flokkur].append({"titill": titill, "islenskt": isl, "ar": ar, "lysing": lysing, "folk": folk})
            continue
        votes, tc, tt, y, rt, pt = best
        rating = ratings.get(tc, (None, 0))[0]
        out[flokkur].append({
            "titill": titill if "|" not in nafn else (pt if pt.lower() in nafn.lower() else titill),
            "islenskt": isl, "ar": y, "lysing": lysing, "folk": folk,
            "imdb": tc, "einkunn": rating, "atkvaedi": votes,
            "minutur": int(rt) if rt.isdigit() else None
        })
# "Um" textinn (úr glærunum "61 áhrifamestu kvikmyndir sögunnar") - sama röð og SOGU.
um = json.load(open("scripts/biolisti-um.json", encoding="utf8"))
# Textinn fyrir fyrstu myndirnar (60 úr glærunum); myndir sem bætt var við síðar (aftast) hafa engan "Um" texta.
assert len(um) <= len(out["Sögufrægustu"]), (len(um), len(out["Sögufrægustu"]))
for f, texti in zip(out["Sögufrægustu"], um):
    f["um"] = texti
# Plagöt (images/biolisti/<imdb>.jpg) ef þau eru til.
import os
for lst in out.values():
    for f in lst:
        if f.get("imdb") and os.path.exists(f"images/biolisti/{f['imdb']}.jpg"):
            f["plagat"] = f"images/biolisti/{f['imdb']}.jpg"
json.dump(out, open("data/biolisti.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()}, "vantar IMDb:", manglar)
