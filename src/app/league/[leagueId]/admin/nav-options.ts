export const getNavOptions = (baseHref: string) => {
  const links: Array<{ href: string; display: string }> = [
    {
      href: baseHref,
      display: "General",
    },
    {
      href: `${baseHref}/members`,
      display: "Members",
    },
  ];
  return links;
};
