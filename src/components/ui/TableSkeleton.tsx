const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr className="border-b border-[hsl(0_0%_100%/0.03)]">
    {Array.from({ length: cols }, (_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className={`skeleton-shimmer rounded h-4 ${i === 0 ? 'w-8' : i === cols - 1 ? 'w-16' : 'w-full max-w-[120px]'}`} />
      </td>
    ))}
  </tr>
);

interface Props {
  cols: number;
  rows?: number;
}

const TableSkeleton = ({ cols, rows = 5 }: Props) => (
  <tbody>
    {Array.from({ length: rows }, (_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </tbody>
);

export default TableSkeleton;
