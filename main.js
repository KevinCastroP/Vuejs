var eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
        <div class="product-image">
            <img v-bind:src="image" v-bind:alt="altText">
        </div>
        <div class="row">
            <div class="product-info col-md-12">
                <h1>{{ title }}</h1>
                <h2>{{ print }}</h2>
                <p v-if="inStock && inventory > 1">In Stock {{ inventory }}</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
                <p>Shipping: {{ shipping }}</p>
                        
                <product-details :details="details"></product-details>

                <div class="color-box"
                    v-for="(count, index) in variants"
                    :key="count.variantId"
                    :style="{ backgroundColor: count.variantColor }"
                    @mouseover="updateProduct(index)">
                </div>
                        
                <div>
                    <a v-bind:href="link" target="_blank">More products like this</a>
                </div>
                        
                <div>
                    <button v-on:click="addToCart"
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }"
                        >Add to Cart</button>
                    <button class="del" v-on:click="removeToCart"
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }"
                        >Remove to Cart</button>
                        
                </div>

                <product-tabs :reviews="reviews"></product-tabs>

            </div>
        </div>
    </div>
    `,
    data() {
        return {
            onSale: false,
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            altText: 'A pair of socks',
            link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
            inventory: 30,
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
            variants: [{
                    variantId: 123,
                    variantColor: "green",
                    variantImage: "./images/vmSocks-green-onWhite.jpg",
                    variantQuantify: 10
                },
                {
                    variantId: 456,
                    variantColor: "blue",
                    variantImage: "./images/vmSocks-blue-onWhite.jpg",
                    variantQuantify: 0
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            colors: ["Green", "Blue"],
            reviews: []
        }
    },
    methods: {
        addToCart: function () {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeToCart: function () {
            this.$emit('del-to-cart')
        },
        updateProduct: function (index) {
            this.selectedVariant = index
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantify
        },
        print() {
            if (this.onSale) {
                return this.brand + ' ' + this.product
            }
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li class="errors" v-for="count in errors">{{ count }}</li>
            </ul>
        </p>

        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name">
        </p>
        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
            </select>
        </p>
        
        <p>Would you recommend this product?</p>
        <label>
            Yes
            <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
            No
            <input type="radio" value="No" v-model="recommend"/>
        </label>
        
        <p>
            <input type="submit" value="Submit">
        </p>
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recommend: null
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required")
                if (!this.review) this.errors.push("Review required")
                if (!this.rating) this.errors.push("Rating required")
                if (!this.recommend) this.errors.push("Recommend required")
            }
        }
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="count in details">{{ count }}</li>
        </ul>
    `
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type:Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs" :key="index"
            @click="selectedTab = tab"
            >
            {{ tab }}</span>
        

            <div v-show="selectedTab === 'Reviews'">
                <h2>Reviews</h2>
                <p v-if="!reviews.length">There are not reviews yet.</p>
                <ul>
                    <li v-for="count in reviews">
                        <p>{{ count.name }}</p>
                        <p>Rating: {{ count.rating }}</p>
                        <p>{{ count.review }}</p>
                    </li>
                </ul>
            </div>

            <product-review v-show="selectedTab === 'Make a Review'"></product-review>
        </div>        
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})


var app = new Vue({
    el: '#app',
    data: {
        premium: false,
        cart: []
    },
    methods: {
        updateCart: function (id) {
            this.cart.push(id)
        },
        deleteCart: function () {
            if (this.cart === 0) {
                this.cart
            } else {
                this.cart.pop()
            }
        }
    }
})