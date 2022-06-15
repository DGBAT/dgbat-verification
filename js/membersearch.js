
let url = {
    email: "mailto:",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    twitter: "https://twitter.com/",
    reddit: "https://reddit.com/u/",
    youtube: "https://youtube.com/",
    telegram: "https://t.me/",
    linkedin: "https://linkedin.com/in/",
    medium: "https://medium.com/@"
} // URL prefixes

window.addEventListener('keydown', function (e) {
    if (e.key === "Enter") {
        searchMember() //search on keyboard press 'Enter'
    }
}, 0);

let searchMember = () => {
    let string = document.querySelector("#member-search__input").value.toLowerCase().trim() || ""; //get search string from input
    try {
        if (!string || string === "") throw "Search string is empty"; //string empty
    } catch (err) {
        console.warn(err);
        return;
    }

    string = (string.substr(0, 1) === "@") ? string.substr(1, string.length) : string; //handle @usernames
    string = string.toLowerCase().trim(); //make string lowercase and trim empty space

    getMembers()
        .then(async (res) => {

            let verified = {
                icon: "success",
                title: "Verified!"
            };

            let unverified = {
                icon: "error",
                title: "Unverified!",
                text: `"${string}" could not be verified, this account might belong to a impersonator or your spelling of the account is incorrect`
            };

            let inputOptions = { "Platform": {} }; //initialize and construct select options object
            let select = {
                icon: "question",
                title: "Select account platform",
                html: `<i>More than one result matching "${string}" found.</i><p><b>Which one did you mean?</b></p>`,
                input: "select",
                inputOptions: inputOptions,
                inputPlaceholder: 'Select a platform',
                showCancelButton: true,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if (value.length > 0) {
                            resolve() //platform selected
                        } else {
                            resolve("No platform selected!") //platform not selected
                        }
                    })
                }
            };

            let results = []; //initialize results array
            for (let entry of res) {
                for (let key in entry) {
                    if (entry[key].toLowerCase() === string) {  //search for exact string
                        let result = {
                            name: entry.name,
                            handle: entry[key],
                            platform: key,
                            type: entry.type
                        };
                        results.push(result)  //push result to results array
                    }
                }
            }

            if (results.length < 1) {  //no matching result(s)

                Swal.fire(unverified); //show unverified modal
            }
            else {
                if (results.length > 1) { //more than one matching result
                    for (let i in results) {
                        let platform = results[i].platform;
                        inputOptions["Platform"][i] = platform; //add selection key and value to select options
                    }

                    let { value: platform } = await Swal.fire(select); //display modal and await selection

                    if (platform) {
                        let result = results[platform];

                        verified.html = `<p>"<b>${result.handle}</b>" is a verified ${result.type}!</p>` +
                            `<p>Platform: <b>${result.platform}</b></p>`; //set modal html

                        verified.footer = `<a target="_blank" href="${url[result.platform.toLowerCase()]}${result.handle}"> View ${(result.type === "channel") ? "channel" : "account"} </a>`; //set modal footer link

                        Swal.fire(verified) //show verified modal
                    }

                } else {
                    let result = results[0];
                    verified.html = `<p>"<b>${result.handle}</b>" is a verified ${result.type}!</p>` +
                        `<p>Platform: <b>${result.platform}</b></p>`; //set modal html

                    verified.footer = `<a target="_blank" href="${url[result.platform.toLowerCase()]}${result.handle}"> View ${(result.type === "channel") ? "channel" : "account"} </a>`; //set modal footer link

                    Swal.fire(verified) //show verified modal
                }
            }
        })
        .catch((err) => console.warn(err))
}

let members;
let getMembers = () => {
    members = [];
    return new Promise((resolve, reject) => {
        $.getJSON('accounts.json').then(data => {
            for (let member of data) {
                members.push(member);
            }
            resolve(members)
        }, () => {
            reject("Member list failed to load")
        })
    })
}
