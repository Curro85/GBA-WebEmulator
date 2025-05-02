import { createContext, useContext, useState } from "react";
import Modal from 'react-modal';
import LoginForm from "../components/LoginForm";
import RomList from '../components/RomList';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({ type: null, props: {} });

    const openModal = (type, props = {}) => setModal({ type, props });
    const closeModal = () => setModal({ type: null, props: {} });

    const renderModal = () => {
        const common = {
            isOpen: modal.type !== null,
            onRequestClose: closeModal,
            overlayClassName: 'fixed inset-0 bg-black/50 flex items-center justify-center',
            className: 'bg-white rounded-lg p-6 max-w-lg mx-auto shadow-xl',
            ariaHideApp: false,
            ...modal.props.modalOptions
        };

        switch (modal.type) {
            case 'login':
                return (
                    <Modal {...common}>
                        <LoginForm onSuccess={closeModal} />
                    </Modal>
                )
            case 'uploadrom':
                return (
                    <Modal {...common}>
                        <RomList onSuccess={closeModal} />
                    </Modal>
                )
            default:
                return null;
        }


    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {renderModal()}
        </ModalContext.Provider>
    )
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) return;
    return context;
}