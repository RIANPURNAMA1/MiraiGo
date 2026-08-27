import { useCallback, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DraggableCalculator({ isOpen, onClose }: Props) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const dragRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 80, y: 120 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    dragging.current = true;
    const rect = dragRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      pos.current = { x: ev.clientX - offset.current.x, y: ev.clientY - offset.current.y };
      if (dragRef.current) {
        dragRef.current.style.left = `${pos.current.x}px`;
        dragRef.current.style.top = `${pos.current.y}px`;
      }
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  function inputDigit(d: string) {
    setDisplay((prev) => (fresh ? d : prev === '0' ? d : prev + d));
    setFresh(false);
  }

  function inputDot() {
    setDisplay((prev) => {
      if (fresh) { setFresh(false); return '0.'; }
      return prev.includes('.') ? prev : prev + '.';
    });
    setFresh(false);
  }

  function handleOp(nextOp: string) {
    const current = parseFloat(display);
    if (prev !== null && op) {
      const result = calculate(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  }

  function calculate(a: number, b: number, operation: string): number {
    switch (operation) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  }

  function handleEquals() {
    if (prev === null || !op) return;
    const current = parseFloat(display);
    const result = calculate(prev, current, op);
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  }

  function handleClear() {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setFresh(true);
  }

  function handlePercent() {
    setDisplay(String(parseFloat(display) / 100));
    setFresh(true);
  }

  function handlePlusMinus() {
    setDisplay(String(parseFloat(display) * -1));
  }

  function handleBackspace() {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }

  if (!isOpen) return null;

  const btn = (label: string, onClick: () => void, wide?: boolean, accent?: boolean) => (
    <button
      key={label}
      onClick={onClick}
      className={`h-10 rounded-md text-sm font-semibold transition-colors ${
        accent
          ? 'bg-[#5e8b5d] text-white hover:bg-[#4d7a4c]'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${wide ? 'col-span-2' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div
      ref={dragRef}
      style={{ left: pos.current.x, top: pos.current.y }}
      className="fixed z-[9999] w-[220px] select-none rounded-xl border border-gray-200 bg-white shadow-2xl"
    >
      {/* Title bar — drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between rounded-t-xl bg-[#1f2022] px-3 py-1.5 cursor-grab active:cursor-grabbing"
      >
        <span className="text-[11px] font-bold text-white tracking-wide">Kalkulator</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xs font-bold">
          ✕
        </button>
      </div>

      {/* Display */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-end rounded-lg bg-[#f3f4f6] px-3 py-2 min-h-[40px]">
          <span className="text-xl font-bold text-gray-900 truncate">{display}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
        {handleClear && (
          <>
            {btn('AC', handleClear, false, false)}
            {btn('±', handlePlusMinus)}
            {btn('%', handlePercent)}
            {btn('÷', () => handleOp('/'), false, true)}
            {btn('7', () => inputDigit('7'))}
            {btn('8', () => inputDigit('8'))}
            {btn('9', () => inputDigit('9'))}
            {btn('×', () => handleOp('*'), false, true)}
            {btn('4', () => inputDigit('4'))}
            {btn('5', () => inputDigit('5'))}
            {btn('6', () => inputDigit('6'))}
            {btn('−', () => handleOp('-'), false, true)}
            {btn('1', () => inputDigit('1'))}
            {btn('2', () => inputDigit('2'))}
            {btn('3', () => inputDigit('3'))}
            {btn('+', () => handleOp('+'), false, true)}
            {btn('0', () => inputDigit('0'), true)}
            {btn('.', inputDot)}
            {btn('=', handleEquals, false, true)}
          </>
        )}
      </div>
    </div>
  );
}
