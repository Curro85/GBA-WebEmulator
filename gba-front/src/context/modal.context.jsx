import { createContext, useContext, useState } from "react";
import Modal from 'react-modal';
import LoginForm from "../components/LoginForm";
import RomList from '../components/RomList';
import RegisterForm from "../components/RegisterForm";
import UserRoms from "../components/UserRoms";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({ type: null, props: {} });

    const openModal = (type, props = {}) => setModal({ type, props });
    const closeModal = () => setModal({ type: null, props: {} });

    const renderModal = () => {
        const common = {
            isOpen: modal.type !== null,
            onRequestClose: closeModal,
            closeTimeoutMS: 300,
            overlayClassName: 'fixed inset-0 bg-black/50 flex items-center justify-center',
            className: 'bg-gray-900 rounded-lg max-w-md w-full mx-auto shadow-xl',
            ariaHideApp: false,
            ...modal.props.modalOptions
        };

        switch (modal.type) {
            case 'login':
                return (
                    <Modal {...common}>
                        <LoginForm
                            onSuccess={closeModal}
                            toRegister={() => {
                                closeModal;
                                openModal('register');
                            }}
                        />
                    </Modal>
                )
            case 'register':
                return (
                    <Modal {...common}>
                        <RegisterForm
                            onSuccess={closeModal}
                            toLogin={() => {
                                closeModal;
                                openModal('login');
                            }}
                        />
                    </Modal>
                )

            case 'loadroms':
                return (
                    <Modal {...common}>
                        <UserRoms onSuccess={closeModal} />
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