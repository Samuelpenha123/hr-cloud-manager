// HR Cloud Manager - Auth Module
const Auth = (() => {
  const TK='hr_token', UK='hr_user';
  return {
    setSession(token,user){localStorage.setItem(TK,token);localStorage.setItem(UK,JSON.stringify(user));},
    clearSession(){localStorage.removeItem(TK);localStorage.removeItem(UK);},
    getUser(){try{return JSON.parse(localStorage.getItem(UK));}catch{return null;}},
    isLoggedIn(){return!!localStorage.getItem(TK);},
    requireAuth(){if(!localStorage.getItem(TK)){location.href='login.html';return false;}return true;},
    async logout(){try{await API.post('/auth/logout');}catch{}this.clearSession();location.href='login.html';},
  };
})();
