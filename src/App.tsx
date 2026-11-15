import { useEffect } from "react";
import { usePath, navigate, onLink } from "@tinymachines/kit/lib/router";
import { useAccount } from "@tinymachines/kit/lib/account";
import { describe } from "@tinymachines/kit/lib/seo";
import { applyHead } from "@tinymachines/kit/lib/head";
import { SiteHeader } from "@tinymachines/kit/components/SiteHeader";
import { SiteFooter } from "@tinymachines/kit/components/SiteFooter";
import { UpdateBar } from "@tinymachines/kit/components/UpdateBar";
import { SharePanel } from "@tinymachines/kit/components/SharePanel";
import ThemePage from "@tinymachines/kit/pages/ThemePage";
import SensorsPage from "@tinymachines/kit/pages/SensorsPage";
import ScanPage from "@tinymachines/kit/pages/ScanPage";
import SharePage from "@tinymachines/kit/pages/SharePage";
import AppPage from "@tinymachines/kit/pages/AppPage";
import Account from "@tinymachines/kit/pages/Account";
import FilesPage from "@tinymachines/kit/pages/FilesPage";
import DevelopersPage from "@tinymachines/kit/pages/DevelopersPage";
import { app } from "@tinymachines/kit/app";
import Home from "./pages/Home";
import { tc, useCopy } from "@tinymachines/kit/lib/copy";

function NotHere({ path }: { path: string }) {
  const t = useCopy();
  const a = app();
  return <article><h1>{t("notHere.title")}</h1><p className="lede">{t("notHere.before")}<code>{path}</code>{t("notHere.after", { line: a.notHere ? tc("app.notHere", a.notHere) : "" })}</p><p><a href="/" onClick={onLink}>{t("notHere.home")}</a></p></article>;
}

export function App() {
  const path = usePath();
  const load = useAccount((s) => s.load);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (path === "/open") navigate("/", { replace: true }); }, [path]);
  useEffect(() => { applyHead(describe(location.pathname, location.search)); }, [path]);
  let page: React.ReactNode;
  if (path === "/") page = <Home />;
  else if (path === "/theme") page = <ThemePage />;
  else if (path === "/sensors") page = <SensorsPage />;
  else if (path === "/scan") page = <ScanPage />;
  else if (path === "/share") page = <SharePage />;
  else if (path === "/app") page = <AppPage />;
  else if (path === "/account") page = <Account />;
  else if (path === "/files") page = <FilesPage />;
  else if (path === "/developers") page = <DevelopersPage />;
  else page = <NotHere path={path} />;
  return (
    <>
      <SiteHeader path={path} />
      <UpdateBar />
      <main>{page}</main>
      <SiteFooter path={path} />
      <SharePanel />
    </>
  );
}
