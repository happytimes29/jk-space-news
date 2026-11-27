import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CircuitBoard, FolderOpen, Wrench } from "lucide-react";
import type { SiteDictionary } from "@/lib/i18n/dictionaries";
import type { NoteItem } from "@/lib/notes";
import { localePath, type Locale } from "@/lib/i18n/locales";
import type { ProjectItem } from "@/lib/projects";
import type { ToolItem } from "@/lib/tools";
import styles from "./SignalHome.module.css";

const copy = {
  "zh-TW": {
    title: ["工程問題，", "動手解。"],
    index: "從這裡開始",
    browse: "依興趣探索",
    reading: "閱讀札記",
    readingDescription: "讀我對生活、工作與學習的觀察。",
    latestNotes: "最新文章",
    toolDescription: "從 RF 匹配、線寬估算到 PCB 測試點比對。",
    projectDescription: "實作過程、設計取捨與驗證紀錄。",
    aboutDescription: "認識 JK，以及這個個人工程實驗室在做什麼。",
    feature: "從一個工程案例讀起",
    readCase: "閱讀專案案例",
    openTool: "開啟比對工具",
  },
  "zh-CN": {
    title: ["工程问题，", "动手解。"],
    index: "从这里开始",
    browse: "按兴趣探索",
    reading: "阅读札记",
    readingDescription: "读我对生活、工作与学习的观察。",
    latestNotes: "最新文章",
    toolDescription: "从 RF 匹配、线宽估算到 PCB 测试点比对。",
    projectDescription: "实现过程、设计取舍与验证记录。",
    aboutDescription: "认识 JK，以及这个个人工程实验室在做什么。",
    feature: "从一个工程案例读起",
    readCase: "阅读项目案例",
    openTool: "打开比对工具",
  },
  en: {
    title: ["Engineering problems.", "Hands-on answers."],
    index: "Start here",
    browse: "Explore the lab",
    reading: "Reading notes",
    readingDescription: "Notes on life, work, and learning.",
    latestNotes: "Latest articles",
    toolDescription: "From RF matching and trace widths to PCB test-point comparison.",
    projectDescription: "How the projects were built, which trade-offs mattered, and how they were tested.",
    aboutDescription: "Meet JK and find out what this independent engineering lab is working on.",
    feature: "Start with a case study",
    readCase: "Read the case study",
    openTool: "Open the comparison tool",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

const toolOrder = ["pcb-test-point", "smith-chart", "transmission-line", "datasheet-workbench"];

export function SignalHome({ locale, dictionary, tools, pcbProject, recentNotes }: {
  locale: Locale;
  dictionary: SiteDictionary;
  tools: ToolItem[];
  pcbProject: ProjectItem | null;
  recentNotes: NoteItem[];
}) {
  const route = (pathname: string) => localePath(locale, pathname);
  const labels = copy[locale];
  const highlights = toolOrder.flatMap((slug) => tools.filter((tool) => tool.slug === slug)).slice(0, 3);
  const pcbTool = tools.find((tool) => tool.slug === "pcb-test-point");
  const browseCards = [
    { title: dictionary.navigation.tools, description: labels.toolDescription, href: route("/tools"), icon: Wrench, color: styles.orange },
    { title: dictionary.navigation.projects, description: labels.projectDescription, href: route("/projects"), icon: FolderOpen, color: styles.mint },
    { title: labels.reading, description: labels.readingDescription, href: route("/notes"), icon: BookOpen, color: styles.lavender },
    { title: dictionary.navigation.about, description: labels.aboutDescription, href: route("/about"), icon: CircuitBoard, color: styles.pink },
  ];

  return (
    <div className={styles.preview}>
      <section className={styles.hero} aria-labelledby="signal-home-title">
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.kicker}>{dictionary.home.eyebrow}</p>
            <h1 id="signal-home-title" className={styles.title}>
              {labels.title[0]}<br /><em>{labels.title[1]}</em>
            </h1>
            <p className={styles.intro}>{dictionary.home.intro}</p>
            <div className={styles.actions}>
              <Link href={route("/tools")} className={styles.button}>{dictionary.common.useTools}<ArrowRight size={18} aria-hidden="true" /></Link>
              <Link href={route("/notes")} className={styles.textLink}>{labels.reading}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
          {highlights.length > 0 && (
            <aside className={styles.board} aria-label={labels.index}>
              <h2>{labels.index}</h2>
              {highlights.map((tool) => (
                <Link key={tool.slug} className={styles.boardRow} href={route(`/tools/${tool.slug}`)}>
                  <div><strong>{tool.title}</strong><small>{tool.summary}</small></div>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </Link>
              ))}
            </aside>
          )}
        </div>
      </section>

      {recentNotes.length > 0 && (
        <section className={`${styles.wrap} ${styles.latest}`} aria-labelledby="signal-latest-title">
          <div className={styles.sectionHeading}>
            <h2 id="signal-latest-title">{labels.latestNotes}</h2>
            <Link href={route("/notes")} className={styles.textLink}>{dictionary.common.allNotes}<ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.noteGrid}>
            {recentNotes.map((note) => {
              const headingId = `signal-note-${note.slug}`;
              return (
                <article key={note.slug} className={styles.noteCard}>
                  <Link href={route(`/notes/${encodeURIComponent(note.slug)}`)} aria-labelledby={headingId} className={styles.noteLink}>
                    {note.coverImage && (
                      <div className={styles.noteCover}>
                        <Image src={note.coverImage} alt={note.coverImageAlt ?? ""} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 42vw" />
                      </div>
                    )}
                    <div className={styles.noteCopy}>
                      <h3 id={headingId}>{note.title}</h3>
                      <p>{note.summary}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className={`${styles.wrap} ${styles.browse}`} aria-labelledby="signal-browse-title">
        <h2 id="signal-browse-title">{labels.browse}</h2>
        <div className={styles.cards}>
          {browseCards.map(({ icon: Icon, href, title, description, color }) => (
            <Link key={href} href={href} className={`${styles.card} ${color}`}>
              <span className={styles.cardIcons}><Icon aria-hidden="true" size={35} strokeWidth={1.75} /><ArrowUpRight aria-hidden="true" size={20} /></span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </Link>
          ))}
        </div>
      </section>

      {pcbProject && (
        <section id="reading" className={`${styles.wrap} ${styles.reading}`} aria-labelledby="signal-reading-title">
          <h2 id="signal-reading-title">{labels.feature}</h2>
          <article className={styles.caseStudy}>
            <div className={styles.caseCopy}>
              <h3>{pcbProject.title}</h3>
              <p>{pcbProject.summary}</p>
              <div className={styles.actions}>
                <Link href={route(`/projects/${pcbProject.slug}`)} className={styles.button}>{labels.readCase}<ArrowRight size={18} aria-hidden="true" /></Link>
                {pcbTool?.appUrl && (
                  <Link href={pcbTool.localizedApp ? route(pcbTool.appUrl) : pcbTool.appUrl} className={styles.textLink}>{labels.openTool}<ArrowUpRight size={16} aria-hidden="true" /></Link>
                )}
              </div>
            </div>
            {pcbTool?.coverImage && (
              <div className={styles.caseImage}>
                <Image src={pcbTool.coverImage} alt={`${pcbTool.title}${dictionary.home.toolImageAltSuffix}`} width={1191} height={730} sizes="(max-width: 760px) 92vw, 46vw" />
              </div>
            )}
          </article>
        </section>
      )}
    </div>
  );
}
