
window.addEventListener("scroll", (event) => {
    let scroll = this.scrollY;
    if (scroll < 100) {
        document.getElementById('go-top').style.display = 'none'
    } else {
        document.getElementById('go-top').style.display = 'block'
    }
});

window.addEventListener('load', (event) => {
    $("a").click(function (event) {
        event.preventDefault()
        let target = event.target
        while (!target.href) {
            target = target.parentNode
        }
        let path = target.href
        let tId = path.lastIndexOf('#')
        let id = path.slice(tId)
        $('html,body').animate({
            scrollTop: $(id).offset().top
        },
            '300');
    });
})