import "server-only";
import { filterArchivedArticles, isArticleArchived } from "./archive";
import { isTopClicked } from "./gsc";
import { getTopNews } from "./news";
import { getArticleBrief, isSubstantialBrief, type ArticleBrief } from "./summary";
import type { Article, Locale } from "./types";

const INDEXABLE_LANGUAGE: Locale = "es";
const INDEXABLE_HOME_LIMIT = 12;

/**
 * Recuperación SEO conservadora: solo se indexan notas en español que tengan
 * una copia durable y estén destacadas ahora o ya hayan recibido clics reales.
 */
async function isIndexingCandidate(lang: Locale, article: Article): Promise<boolean> {
  if (lang !== INDEXABLE_LANGUAGE) return false;
  if (!(await isArticleArchived(lang, article.id))) return false;

  const [top, clicked] = await Promise.all([
    getTopNews(lang, INDEXABLE_HOME_LIMIT),
    isTopClicked(article.id),
  ]);
  return clicked || top.some((candidate) => candidate.id === article.id);
}

/** Resultado compartido entre metadata y el render de la página. */
export interface ArticleIndexingDecision {
  indexable: boolean;
  brief: ArticleBrief | null;
}

/** Exige durabilidad, selección editorial y una síntesis larga ya generada. */
export async function evaluateArticleIndexing(
  lang: Locale,
  article: Article,
): Promise<ArticleIndexingDecision> {
  if (!(await isIndexingCandidate(lang, article))) {
    return { indexable: false, brief: null };
  }
  const brief = await getArticleBrief(article, lang);
  return { indexable: isSubstantialBrief(brief), brief };
}

export async function getIndexableSitemapArticles(): Promise<Article[]> {
  const top = await getTopNews(INDEXABLE_LANGUAGE, INDEXABLE_HOME_LIMIT);
  const durable = await filterArchivedArticles(INDEXABLE_LANGUAGE, top);
  const evaluated = await Promise.all(
    durable.map(async (article) => ({
      article,
      brief: await getArticleBrief(article, INDEXABLE_LANGUAGE),
    })),
  );
  return evaluated
    .filter(({ brief }) => isSubstantialBrief(brief))
    .map(({ article }) => article);
}
