import { useState } from 'react';
import { useAuth } from '../context/auth.context';

function Profile() {
    const { user } = useAuth();

    return (
        <div>
            {user ? (
                <span>{user}</span>
            ) : (
                <span>Trócola</span>
            )}
        </div>
    )
}

export default Profile