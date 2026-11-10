# Shadow Hunt

Une version web de Scotland Yard, jouée contre l'ordinateur. Tu choisis ton camp : les détectives, qui se partagent la ville pour traquer Mister X, ou Mister X, qui doit rester caché jusqu'à la fin de la partie.

J'ai commencé ce projet pour avoir un vrai jeu à montrer, pas un énième exemple de todo-list : un moteur de règles à écrire, des cartes à dessiner à la main, et une IA qui ne soit pas juste aléatoire.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir l'adresse affichée dans le terminal (en général http://localhost:5173).

Autres commandes :

```bash
npm run build   # build de production
npm run lint    # oxlint
npm test        # tests unitaires (Vitest)
```

## Les règles

- Deux détectives affrontent Mister X. Tu en contrôles un camp, l'ordinateur joue l'autre.
- Chaque déplacement consomme un ticket : taxi, bus ou métro. Les réserves sont limitées et dépendent de la carte.
- Mister X dispose en plus de tickets noirs : ils cachent aux détectives le transport utilisé.
- Mister X n'est visible qu'à certains tours (les « révélations »). Entre deux, les détectives ne voient que les transports qu'il a pris.
- Les détectives gagnent s'ils arrivent sur sa station. Mister X gagne s'il tient jusqu'au dernier tour.

### Une liaison, un ticket

C'est la règle qui a demandé le plus de réflexion. Une liaison relie deux stations et se parcourt en un seul ticket, quelle que soit la distance dessinée entre les deux. Un bus peut donc passer devant une station sans s'y arrêter : on ne peut y descendre que si elle est un arrêt de bus.

Sur le plateau, chaque station affiche des pastilles de couleur : jaune pour le taxi, vert pour le bus, rouge pour le métro. Le taxi dessert tout, le bus beaucoup moins, le métro encore moins, mais avec des sauts bien plus longs. C'est ce qui rend les deux derniers intéressants.

## Cartes

| Carte | Stations | Particularité |
| --- | --- | --- |
| Vieux-Port | 20 | Plus petite, le métro y saute plusieurs stations d'un coup. |
| Grand Boulevard | 28 | Un grand axe central, un quartier d'affaires dense et un port au sud-est. |

Une carte est un simple fichier TypeScript dans `src/game/maps/` : la liste des stations (avec leur position en pourcentage du plateau), les connexions et l'équilibrage (tickets, départs, tours de révélation). L'écran de sélection lit le registre des cartes, donc en ajouter une ne demande pas de toucher à l'interface.

Les fonds sont des images générées, étirées pour suivre exactement les positions en pourcentage des stations.

## L'IA

L'ordinateur joue le camp que tu ne joues pas, avec trois niveaux (facile, normal, difficile).

**Mister X** choisit la station qui l'éloigne le plus du détective le plus proche, en évitant les endroits où il pourrait se retrouver coincé. Il garde ses tickets noirs en réserve et les utilise surtout quand un détective est proche ou quand il prend le métro, qui le trahirait beaucoup.

**Les détectives** estiment l'ensemble des positions possibles de Mister X : on part de sa dernière position connue, et pour chaque coup joué depuis, on suit les liaisons compatibles avec le transport annoncé (n'importe lesquelles si le ticket était noir). Chaque détective se place pour être au plus près de cet ensemble en tenant compte des autres, ce qui les répartit naturellement. Ils n'utilisent que ce qu'un joueur humain verrait aussi, jamais la vraie position de Mister X.

Les niveaux jouent sur la part de hasard : un niveau facile fait des étourderies, un niveau difficile joue presque toujours le meilleur coup. J'ai réglé ça en faisant jouer des centaines de parties IA contre IA et en regardant les taux de victoire.

À deux détectives, Mister X est favori, surtout sur Grand Boulevard.

## Structure

```
src/
  components/      écrans, plateau, barre latérale, en-tête
  game/
    engine/
      movement.ts      déplacements possibles, consommation des tickets
      ai.ts            IA de Mister X et des détectives
      pathfinding.ts   distances entre stations
    maps/              une carte par fichier + registre
    types/             types du jeu (cartes, joueurs, configuration)
    players.ts         création des joueurs de départ
    persistence.ts     sauvegarde de la partie (localStorage)
  App.tsx              enchaînement des écrans et boucle de jeu
```

Le moteur (`game/`) ne dépend pas de React : c'est ce qui permet de le tester seul et de faire jouer l'IA contre elle-même.

## Tests

Les tests couvrent ce qui bouge peu : le moteur de déplacement, la création des joueurs, l'IA et la validité de chaque carte. Pour les cartes, ils vérifient entre autres que le réseau est connexe, qu'il n'y a pas de doublon, que le bus et le métro sont plus rares que le taxi et qu'aucune ligne ne passe sur un arrêt du même transport sans s'y arrêter. Une nouvelle carte est testée automatiquement dès qu'elle est ajoutée au registre.

## Stack

React 19, TypeScript, Vite, CSS classique (sans bibliothèque de composants), Vitest, oxlint.

## Pistes pour la suite

- une légende et la mise en avant des liaisons au survol d'une station
- une animation du déplacement des pions
- un nombre de détectives réglable
- une troisième carte
- le multijoueur local

## Inspiration

Le jeu est inspiré de Scotland Yard (Ravensburger). Ce projet n'est pas affilié à Ravensburger : les cartes, les noms et les visuels sont les miens.
