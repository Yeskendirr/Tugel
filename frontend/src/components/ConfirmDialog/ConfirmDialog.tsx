import Modal from '../Modal/Modal';
import './ConfirmDialog.css';

interface Props {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Растау">
      <p className="confirm-msg">{message}</p>
      <div className="confirm-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Болдырмау</button>
        <button className="btn btn-danger" onClick={onConfirm}>Жою</button>
      </div>
    </Modal>
  );
}
