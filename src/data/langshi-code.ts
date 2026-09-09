/**
 * 流浪尸潮 CH3 · C# 源码（Vite ?raw 打进 bundle，不依赖 public 静态读取）
 */
export type LangshiCodeFile = {
  name: string;
  /** 相对 code/ 的路径，如 Core/Character/Core.cs */
  rel: string;
  category: string;
  code: string;
};

export type LangshiCodeGroups = Record<string, LangshiCodeFile[]>;

const modules = import.meta.glob("./langshi-ch3/code/**/*.cs", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseRel(modulePath: string): { rel: string; category: string; name: string } {
  const marker = "/langshi-ch3/code/";
  const idx = modulePath.replace(/\\/g, "/").lastIndexOf(marker);
  const rel =
    idx >= 0
      ? modulePath.replace(/\\/g, "/").slice(idx + marker.length)
      : modulePath.replace(/^.*\/code\//, "");
  const parts = rel.split("/");
  const name = parts[parts.length - 1] ?? rel;
  const category = parts.length > 1 ? parts[0]! : "Root";
  return { rel, category, name };
}

function buildGroups(): LangshiCodeGroups {
  const groups: LangshiCodeGroups = {};
  for (const [modPath, code] of Object.entries(modules)) {
    const { rel, category, name } = parseRel(modPath);
    const file: LangshiCodeFile = { name, rel, category, code };
    (groups[category] ??= []).push(file);
  }
  for (const list of Object.values(groups)) {
    list.sort((a, b) => a.rel.localeCompare(b.rel));
  }
  return groups;
}

export const langshiCodeGroups: LangshiCodeGroups = buildGroups();

export const langshiCodeFiles: LangshiCodeFile[] = Object.keys(langshiCodeGroups)
  .sort((a, b) => a.localeCompare(b))
  .flatMap((cat) => langshiCodeGroups[cat] ?? []);

/** CH-03 重点骨架（状态机 / 角色核 / 事件 / 对象池 / 能力基类） */
export const LANGSHI_KEY_RELS = [
  "Core/Character/CharacterStates.cs",
  "Core/Character/Core.cs",
  "Events/GameEvents.cs",
  "Others/ObjectPool.cs",
  "Abilities/Ability_Base.cs",
] as const;

export function getLangshiKeyFiles(): LangshiCodeFile[] {
  const byRel = new Map(langshiCodeFiles.map((f) => [f.rel.replace(/\\/g, "/"), f]));
  return LANGSHI_KEY_RELS.map((rel) => byRel.get(rel)).filter((f): f is LangshiCodeFile => Boolean(f));
}
