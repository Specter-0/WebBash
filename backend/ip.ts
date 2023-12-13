export default function getGeo() {
    fetch("https://api.ipify.org/")
        .then(ipResponse => ipResponse.text())
        .then(ip => {
            fetch(`http://ipwho.is/${ip}?output=json`)
                .then(geoResponse => geoResponse.json())
                .then(geo => {
                    console.log(geo)
                })
        })
}