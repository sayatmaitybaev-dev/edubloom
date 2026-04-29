export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  return (
    <div className={`font-bold ${sz} text-pink-500 tracking-tight select-none`}>
      Edu<span className="text-pink-700">Bloom</span>
      <span className="text-pink-400 ml-1">🌸</span>
    </div>
  );
}
