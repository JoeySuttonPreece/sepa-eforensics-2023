export default function PrintButton({ onPrint }: { onPrint: Function }) {
  return (
    <div className="dropdown">
      <button type="button">Print</button>
      <div className="dropdown-content">
        <button
          type="button"
          onClick={() => {
            onPrint('pdf');
          }}
        >
          PDF
        </button>
        <button
          type="button"
          onClick={() => {
            onPrint('csv');
          }}
        >
          CSV
        </button>
        <button
          type="button"
          onClick={() => {
            onPrint('json');
          }}
        >
          JSON
        </button>
      </div>
    </div>
  );
}
