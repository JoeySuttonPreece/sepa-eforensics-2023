import './ErrorMessageComponent.css';

export default function ErrorMessageComponent({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return (
    <div>
      <p className="error-message">{errorMessage}</p>
    </div>
  );
}
