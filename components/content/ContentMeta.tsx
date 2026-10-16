interface Props {
  role?: string;
  year?: number;
  updatedAt: string;
}

export function ContentMeta({ role, year, updatedAt }: Props) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#55555b] dark:text-[#a1a1aa]">
      {role && <div><dt className="font-medium">角色</dt><dd>{role}</dd></div>}
      {year && <div><dt className="font-medium">年份</dt><dd>{year}</dd></div>}
      <div><dt className="font-medium">最後更新</dt><dd><time dateTime={updatedAt}>{updatedAt.slice(0, 10)}</time></dd></div>
    </dl>
  );
}
