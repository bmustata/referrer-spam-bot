Router.configure({
    layoutTemplate: 'main_layout',
    // notFoundTemplate: 'admin_notFound'
});

Router.route('/', function () {

    this.render('homepage');
}, {name: 'homepage'});

Router.route('/how-it-works', function () {

    this.render('howitworks');
}, {name: 'howitworks'});

Router.route('/articles', function () {

    this.render('articles');
}, {name: 'articles'});

Router.route('/contact', function () {

    this.render('contact');
}, {name: 'contact'});