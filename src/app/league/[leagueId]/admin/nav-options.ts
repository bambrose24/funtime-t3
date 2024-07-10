export const getNavOptions = (baseHref: string) => {
  const links: Array<{ href: string; display: string; id: string }> = [
    {
      href: baseHref,
      display: "General",
      id: "general",
    },
    {
      id: "members",
      href: `${baseHref}/members`,
      display: "Members",
    },
  ];
  return links;
};
