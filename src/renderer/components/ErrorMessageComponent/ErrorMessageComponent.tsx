import styles from './ErrorMessageComponent.scss';

export default function ErrorMessageComponent({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return (
    <div>
      <p className={styles.errorMessage}>{errorMessage}</p>
    </div>
  );
}
