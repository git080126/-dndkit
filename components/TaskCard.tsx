type Props = {
  children: React.ReactNode;
};

export default function TaskCard({ children }: Props) {
  return (
    <div className="p-3 mb-2 rounded-lg bg-indigo-500 text-white cursor-grab shadow-md">
      {children}
    </div>
  );
}
