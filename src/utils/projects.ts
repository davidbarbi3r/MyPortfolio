import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post, LocalizedPost } from '~/types';
import { APP_PROJECTS, I18N } from '~/utils/config';
import { cleanSlug, trimSlash, PROJECTS_BASE, PROJECT_PERMALINK_PATTERN, 
    // CATEGORY_BASE,
    //  TAG_BASE 
} from './permalinks';

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = PROJECT_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedPost = async (project: CollectionEntry<'project'>): Promise<Post> => {
  const { id, slug: rawSlug = '', data } = project;
  const { Content, remarkPluginFrontmatter } = await project.render();

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  const locale = id.split('/')[0];
  const slug = cleanSlug(rawSlug); // cleanSlug(rawSlug.split('/').pop());
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;
  const category = rawCategory ? cleanSlug(rawCategory) : undefined;
  const tags = rawTags.map((tag: string) => cleanSlug(tag));
  const permalink = await generatePermalink({ id, slug, publishDate, category });
 
  return {
    id: id,
    slug: slug,
    permalink: locale === I18N.defaultLocale ? permalink.split('/')[1] : permalink,
    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    category: category,
    tags: tags,
    author: author,

    draft: draft,

    metadata,

    Content: Content,
    // or 'content' in case you consume from API

    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const load = async function (): Promise<Array<Post>> {
  const projects = await getCollection('project');
  const normalizedPosts = projects.map(async (project) => await getNormalizedPost(project));

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((project) => !project.draft);

  return results;
};

let _projects: Array<Post>;
let _projectsLocalized : Array<LocalizedPost>;
export const paginatedPostsByLang = new Map<string, Array<Post>>();

/** */
export const isProjectsEnabled = APP_PROJECTS.isEnabled;
export const isProjectsListRouteEnabled = APP_PROJECTS.list.isEnabled;
export const isProjectsPostRouteEnabled = APP_PROJECTS.project.isEnabled;
export const isProjectsCategoryRouteEnabled = APP_PROJECTS.category.isEnabled;
export const isProjectsTagRouteEnabled = APP_PROJECTS.tag.isEnabled;

export const projectsListRobots = APP_PROJECTS.list.robots;
export const projectsPostRobots = APP_PROJECTS.project.robots;
export const projectsCategoryRobots = APP_PROJECTS.category.robots;
export const projectsTagRobots = APP_PROJECTS.tag.robots;

export const projectsPerPage = APP_PROJECTS?.projectsPerPage;

/** */
export const fetchLocalizedProjects = async (): Promise<Array<LocalizedPost>> => {
  if (!_projects) {
    _projects = await load();

    const common_slugs = [...new Set(_projects.map((project) => project.slug.split('/')[1]))];
    _projectsLocalized = common_slugs.map((id) => {
      const projectsLocalizedMap = Object.keys(I18N.locales).reduce((map, locale) => {
        const project = _projects.find((project) => project.slug === `${locale}/${id}`);
        map[locale] = project;
        return map;
    }, {});
      return {
        common_slug: id,
        locales: projectsLocalizedMap
      }
    });
  }

  return _projectsLocalized;
};

/** */
export const fetchProjects = async (locale: string): Promise<Array<Post>> => {
  const _projectsLocalized = await fetchLocalizedProjects();
  return _projectsLocalized
    .map((project) => project.locales[locale])
    .filter((project): project is Post => project !== undefined);
};

/** */
export const findPostsBySlugs = async (slugs: Array<string>, locale: string): Promise<Array<Post>> => {
  if (!Array.isArray(slugs)) return [];

  const projects = await fetchProjects(locale);

  return slugs.reduce(function (r: Array<Post>, slug: string) {
    projects.some(function (project: Post) {
      return slug === project.slug && r.push(project);
    });
    return r;
  }, []);
};

/** */
export const findPostsByIds = async (ids: Array<string>, locale: string): Promise<Array<Post>> => {
  if (!Array.isArray(ids)) return [];

  const projects = await fetchProjects(locale);

  return ids.reduce(function (r: Array<Post>, id: string) {
    projects.some(function (project: Post) {
      return id === project.id && r.push(project);
    });
    return r;
  }, []);
};

/** */
export const findLatestPosts = async ({ count }: { count?: number }, locale: string): Promise<Array<Post>> => {
  const _count = count || 4;
  const projects = await fetchProjects(locale);

  return projects ? projects.slice(0, _count) : [];
};

/** */
export const getStaticPathsProjectsList = async ({ paginate }) => {
  if (!isProjectsEnabled || !isProjectsListRouteEnabled) return [];
  const _projectsLocalized = await fetchLocalizedProjects();

  return paginate(_projectsLocalized, {
    params: { projects: PROJECTS_BASE || undefined },
    pageSize: projectsPerPage,
    });
};

/** */
export const getStaticPathsProjectsPost = async () => {
  if (!isProjectsEnabled || !isProjectsPostRouteEnabled) return [];
  const _projectsLocalized = await fetchLocalizedProjects();

  return _projectsLocalized.map((project) => ({
    params: {
      projects: project.common_slug,
    },
    props: { project },
  }));
};
