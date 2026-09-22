import { maps } from "../../../game/maps";
import "./Rules.css";

interface RulesProps {
  onBack: () => void;
}

function Rules({ onBack }: RulesProps) {
  const allMaps = Object.values(maps);

  return (
    <div className="rules">
      <div className="rules__content">
        <button type="button" className="rules__back" onClick={onBack}>
          ← Retour
        </button>

        <h1>Règles du jeu</h1>

        <section className="rules__section">
          <h2>L'objectif</h2>

          <p>
            Un joueur incarne <strong>Mister X</strong>, un fugitif qui se
            déplace dans l'ombre. Les autres stations sont occupées par des{" "}
            <strong>détectives</strong>, qui cherchent à le localiser et à se
            poser sur sa case pour l'arrêter.
          </p>

          <p>
            Vous choisissez un camp avant chaque partie. Les détectives
            gagnent en capturant Mister X. Mister X gagne s'il tient jusqu'à
            la fin de la partie sans être capturé, ou si tous les détectives
            se retrouvent bloqués (plus aucun déplacement possible).
          </p>
        </section>

        <section className="rules__section">
          <h2>Le plateau et les déplacements</h2>

          <p>
            La carte est un réseau de stations reliées par des trajets. Chaque
            trajet propose un ou plusieurs moyens de transport — 🚕 taxi, 🚌
            bus, 🚇 métro — représentés par des lignes de couleur différente.
            À votre tour, cliquez sur une station accessible : si plusieurs
            transports y mènent, un sélecteur vous laisse choisir lequel
            utiliser.
          </p>

          <p>
            Un détective qui peut se déplacer est obligé de le faire : il ne
            peut pas passer son tour tant qu'une destination lui est
            accessible. Mister X, lui, peut toujours passer.
          </p>
        </section>

        <section className="rules__section">
          <h2>Les tickets</h2>

          <p>
            Chaque déplacement consomme un ticket du transport emprunté.
            Une fois un type de ticket épuisé, les trajets qui en dépendent
            uniquement ne sont plus accessibles — gérez-les avec attention,
            surtout en fin de partie.
          </p>
        </section>

        <section className="rules__section">
          <h2>Le ticket noir de Mister X</h2>

          <p>
            Mister X dispose en plus de <strong>tickets noirs</strong>. Un
            ticket noir remplace n'importe quel ticket de transport pour un
            déplacement — et surtout, il cache aux détectives lequel a
            réellement été utilisé. Dans l'historique visible par les
            détectives, ce déplacement apparaît comme <strong>❓</strong> au
            lieu de l'icône du transport.
          </p>
        </section>

        <section className="rules__section">
          <h2>Les révélations</h2>

          <p>
            Mister X reste invisible sur la carte la plupart du temps. À
            intervalles réguliers (voir le détail par carte ci-dessous), sa
            position est révélée aux détectives et reste affichée jusqu'à la
            révélation suivante — même s'il continue à se déplacer
            entre-temps sans que sa nouvelle position soit connue.
          </p>
        </section>

        <section className="rules__section">
          <h2>Fin de partie</h2>

          <ul>
            <li>
              <strong>Victoire des détectives</strong> : l'un d'eux se
              retrouve sur la même station que Mister X — même sans le
              savoir à l'avance, si sa position réelle était encore cachée.
            </li>
            <li>
              <strong>Victoire de Mister X</strong> : il n'est pas capturé
              avant la fin du dernier tour de la carte, ou tous les
              détectives sont simultanément incapables de se déplacer.
            </li>
          </ul>
        </section>

        {allMaps.length > 0 && (
          <section className="rules__section">
            <h2>Sur {allMaps.length > 1 ? "les cartes disponibles" : "cette carte"}</h2>

            {allMaps.map((map) => {
              const { ticketsByRole, revealTurns, finalTurn } = map.balance;

              return (
                <div key={map.id} className="rules__map-balance">
                  {allMaps.length > 1 && <h3>{map.name}</h3>}

                  <ul>
                    <li>Durée de la partie : {finalTurn} tours.</li>

                    <li>
                      Mister X est révélé aux tours {revealTurns.join(", ")}.
                    </li>

                    <li>
                      Tickets par détective : {ticketsByRole.detective.taxi} 🚕
                      / {ticketsByRole.detective.bus} 🚌 /{" "}
                      {ticketsByRole.detective.metro} 🚇.
                    </li>

                    <li>
                      Tickets de Mister X : {ticketsByRole["mister-x"].taxi} 🚕
                      / {ticketsByRole["mister-x"].bus} 🚌 /{" "}
                      {ticketsByRole["mister-x"].metro} 🚇, plus{" "}
                      {ticketsByRole["mister-x"].black ?? 0} tickets noirs.
                    </li>
                  </ul>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default Rules;
