import string


def validate_password(password):
    if len(password) < 8:
        return 'La contraseña debe tener al menos 8 caractéres.'
    if not any(char.isupper() for char in password):
        return 'La contraseña debe incluir al menos una letra mayúscula.'
    if not any(char.islower() for char in password):
        return 'La contraseña debe incluir al menos una letra minúscula.'
    if not any(char.isdigit() for char in password):
        return 'La contraseña debe incluir al menos un número.'
    if not any(char in string.punctuation for char in password):
        return 'La contraseña debe incluir al menos un carácter especial.'
    return None

