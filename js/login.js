import "../app.js";

let recaptchaResponse, confirmationResult, recaptchaVerifier;

const app = new Vue({
    el: "#root",
    data() {
        return {
            user: {},
        };
    },
    methods: {
        signOut() {
            firebase.auth().signOut();
        },

        signInWithGoogle() {
            let provider = new firebase.auth.GoogleAuthProvider;
            firebase.auth().signInWithRedirect(provider);
        },

        signInWithGithub() {
            let provider = new firebase.auth.GithubAuthProvider;

            firebase.auth().signInWithRedirect(provider);
        },
    }
});

firebase.auth().getRedirectResult().then(result => {
    if (result.user) {
        let notification_message = JSON.stringify(result.additionalUserInfo);
        sessionStorage.setItem('__flash_notification_message', notification_message);
        location.assign('dashboard.html');
    } else {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                location.assign('dashboard.html');
            }
        });
    }
});

window.signInWithPhoneNumber = function (el) {
    el.remove();
    firebase.auth().useDeviceLanguage();

    let loginForm = document.querySelector('#login-form');
    let elements = loginForm.querySelectorAll('label');

    let accessibilities = loginForm.querySelector('#accessibilities');
    if (accessibilities instanceof HTMLElement) {
        accessibilities.remove();
    }
    let btn = loginForm.querySelector('#sign-in-button');
    let username = elements[0];
    let password = elements[1];
    let phoneLabel = username.childNodes[1];
    let phoneNumber = username.childNodes[3];
    let verifyLabel = password.childNodes[1];
    let verifyToken = password.childNodes[3];

    btn.innerText = 'Send';

    phoneLabel.textContent = 'Phone Number';
    phoneNumber.type = 'tel';
    phoneNumber.name = phoneNumber.id = 'phoneNumber';
    phoneNumber.placeholder = '+9595001234';

    verifyLabel.textContent = 'Verficiation Code';
    verifyToken.id = verifyToken.name = 'token';
    verifyToken.placeholder = 'Enter 6-digits SMS Verfication';
    verifyToken.type = 'tel';

    phoneNumber.setAttribute('autocomplete', 'off');
    phoneNumber.select();
    phoneNumber.value = '+12028447236';

    verifyToken.setAttribute('disabled', 'true');

    recaptchaVerifier = new firebase.auth.RecaptchaVerifier(btn.id, {
        'size': 'invisible',
        'callback': () => onSignInSubmit()
    });

    let _eid = btn.addEventListener('click', () => {
        if (recaptchaResponse === '') {
            return console.log('recaptchaed');
        }
        btn.innerText = 'verifing...';
        recaptchaVerifier.render()
            .then(widget => {
                grecaptcha.getResponse(widget);
                phoneNumber.setAttribute('readonly', 'true');
                btn.innerText = 'sending...';
                btn.setAttribute('disabled', 'true');
                signInWithPhone()
            });
    });

    function onSignInSubmit() {
        removeEventListener("click", _eid);
        confirmationResult
            .confirm(verifyToken.value)
            .then(result => {
                console.log(result)
            })
            .catch(err => {
                btn.innerText = 'Send';
                btn.setAttribute('disabled', 'true');
                phoneNumber.setAttribute('disabled', 'true');
                phoneNumber.select();
                var b = password.querySelector('code') || document.createElement('code');
                b.textContent = err.message;
                b.style.fontSize = '10px';
                b.style.color = '#ee2a2c';
                password.append(b);
                _eid = btn.addEventListener('click', () => {
                    var credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, verifyToken.value);
                    firebase.auth().signInWithCredential(credential)
                        .then(result => console.log('after err!OK', result))
                        .catch(err => console.log('after err! Failed', err));
                });
            });
    }

    function signInWithPhone() {
        removeEventListener("click", _eid);
        console.log('session verification id')
        firebase.auth()
            .signInWithPhoneNumber(phoneNumber.value, recaptchaVerifier)
            .then(confirmation => {
                btn.textContent = 'Confirm';
                btn.removeAttribute('disabled');
                verifyToken.removeAttribute('disabled');
                verifyToken.select();
                confirmationResult = window.confirmationResult = confirmation;
                console.log(confirmation.verificationId)
                _eid = btn.addEventListener('click', () => onSignInSubmit());
            }).catch(err => {
                phoneNumber.select();
                let e = document.createElement('code');
                e.textContent = err.message;
                username.appendChild(e);
            });
    }
};
