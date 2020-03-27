<template>
    <div>
        <section class="hero is-dark is-fullheight">
            <div class="hero-head">
                <header class="navbar">
                    <div class="container">
                        <div class="navbar-start">
                            <div class="navbar-item">
                                <h1 class="title is-1">qk</h1>
                            </div>
                        </div>
                        <div class="navbar-end">
                            <span class="navbar-item">
                                <button class="button is-danger is-inverted" @click="donate()">
                                    <span class="icon">
                                        <i class="mdi mdi-heart"></i>
                                    </span>
                                    <span>donate</span>
                                </button>
                            </span>
                        </div>
                    </div>
                </header>
            </div>

            <div class="hero-body">
                <div class="container has-text-centered">
                    <div class="columns is-centered">
                        <div class="column is-8">
                            <div class="box">
                                <div class="field">
                                    <input
                                        id="url"
                                        v-model="url"
                                        class="input is-large has-text-centered shorten-input"
                                        :class="shortened ? 'has-text-link' : ''"
                                        type="text"
                                        placeholder="shorten your url"
                                        @keyup="urlInputTrigger()"
                                        @keyup.enter="shorten(url)"
                                    />
                                </div>
                                <div v-if="!shortened" class="field">
                                    <button
                                        class="button is-large is-link is-fullwidth"
                                        @click="shorten(url)"
                                    >shorten</button>
                                </div>
                                <div v-if="shortened" class="field">
                                    <button
                                        class="button is-large is-success is-fullwidth"
                                        @click="copyUrl()"
                                        :disabled="!shortened && !shortening"
                                    >copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
const isValidUrl = url => {
    var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // fragment locator
    return !!pattern.test(url);
};

const isQkUrl = url => {
    var pattern = /^(https?:\/\/)?([a-z\.]+\.)?qk.pt(\/.*)?$/i;
    return !!pattern.test(url);
};

export default {
    data() {
        return {
            url: "",
            shortened: false,
            shortening: false,
            shortenedUrl: ""
        };
    },
    methods: {
        donate() {
            window.open(
                "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=42WKJJPDXJY5J&item_name=Support+qk+and+other+dg7+projects&currency_code=EUR&source=url"
            );
        },
        async shorten(url) {
            this.shortening = true;
            if (this.shortened) {
                this.shortening = false;
                return;
            }

            url = url.trim();

            if (!url.match(/^https?:\/\//)) {
                url = `http://${url}`;
            }

            if (!isValidUrl(url)) {
                this.alert("That's an invalid URL");
                this.shortening = false;
                return;
            }

            if (isQkUrl(url)) {
                this.alert("Already a shortened URL");
                this.shortening = false;
                return;
            }

            let response;
            try {
                response = await axios.post("/api/shorten", { url });
            } catch (error) {
                console.log(error.response);
                this.alert(error.response);
            }

            let data = response.data;
            if (data && data.url) {
                this.url = data.url;
                this.shortenedUrl = data.url;
                this.shortened = true;
            }

            this.shortening = false;
        },
        alert(message, type = "is-warning") {
            this.$buefy.snackbar.open({
                message,
                type: "is-warning"
            });
        },
        copyUrl() {
            let copyTextarea = document.querySelector("#url");
            copyTextarea.focus();
            copyTextarea.select();

            let success = false;
            try {
                success = document.execCommand("copy");
            } catch (_) {}

            if (success) {
                this.alert("URL copied!", "is-success");
            }
        },
        urlInputTrigger() {
            if (
                this.shortened &&
                this.shortenedUrl &&
                this.url != this.shortenedUrl
            ) {
                this.shortenedUrl = "";
                this.shortened = false;
            }
        }
    }
};
</script>

<style>
.shorten-input::placeholder {
    color: #0000004f;
}
</style>