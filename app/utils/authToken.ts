import Cookies from 'js-cookie';


const TokenKey = 'oauth-token'

export function getToken(): string | undefined{
    return Cookies.get(TokenKey)
}

export function setToken(token: string) {
    Cookies.set(TokenKey, token)
}

export function removeToken() {
    Cookies.remove(TokenKey)
}