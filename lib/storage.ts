export const saveLayout = (layout: number[]) => {
  localStorage.setItem("dashboard-layout", JSON.stringify(layout));
};

export const loadLayout = (): number[] | null => {
  const saved = localStorage.getItem("dashboard-layout");
  return saved ? JSON.parse(saved) : null;
};
