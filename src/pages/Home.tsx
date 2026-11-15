// The front door: what MAD Protocol is, how it is won and played, and the way in. The game itself is a page of its
// own at /play/index.html (site/, copied there by scripts/game.sh), outside this app's frame; the app's worker keeps
// it with the rest of the build, so it opens with no network.
import { app } from "@tinymachines/kit/app";
import { ShareButton } from "@tinymachines/kit/components/ShareButton";
import { useCopy } from "@tinymachines/kit/lib/copy";

export const GAME = "/play/index.html";

export default function Home() {
  const t = useCopy();
  const kv = (keys: string[]) => keys.map((k) => [<dt key={`${k}t`}>{t(`${k}.term`)}</dt>, <dd key={`${k}d`}>{t(`${k}.text`)}</dd>]);
  return (
    <article className="md-home">
      <p className="kicker">{app().name} · <b>{t("home.kicker")}</b></p>
      <h1>{app().name}</h1>
      <p className="lede">{t("home.lede")}</p>
      <p className="controls">
        <a className="btn solid md-play" href={GAME} data-k="play">{t("home.play")}</a>
        <ShareButton label={t("home.share")} />
      </p>

      <section className="panel" data-k="how">
        <h2>{t("home.how.title")}</h2>
        <p>{t("home.how.text")}</p>
      </section>

      <section className="panel" data-k="levels">
        <h2>{t("home.levels.title")}</h2>
        <dl className="kv">{kv(["home.levels.recruit", "home.levels.veteran", "home.levels.war"])}</dl>
        <p className="note">{t("home.levels.note")}</p>
      </section>

      <section className="panel" data-k="keys">
        <h2>{t("home.keys.title")}</h2>
        <dl className="kv">{kv(["home.keys.move", "home.keys.aim", "home.keys.thrust", "home.keys.reload", "home.keys.pause"])}</dl>
      </section>

      <section className="panel" data-k="touch">
        <h2>{t("home.touch.title")}</h2>
        <p>{t("home.touch.text")}</p>
      </section>

      <section className="panel" data-k="made">
        <h2>{t("home.made.title")}</h2>
        <p>{t("home.made.text")}</p>
        <p className="note">{t("home.made.note")}</p>
      </section>

      <p className="src">{t("home.src.before")}<a href="/play/assets/three.LICENSE.txt">{t("home.src.mit")}</a>{t("home.src.middle")}<a href="/play/assets/fonts/chakra-petch.LICENSE.txt">{t("home.src.chakra")}</a>{t("home.src.and")}<a href="/play/assets/fonts/share-tech-mono.LICENSE.txt">{t("home.src.mono")}</a>{t("home.src.after")}<a href="https://tinykit.tinymachines.ai/">{t("home.src.kit")}</a>{t("home.src.end")}</p>
    </article>
  );
}
