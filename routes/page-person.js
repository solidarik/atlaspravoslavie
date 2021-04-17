module.exports = async function(ctx, next) {
    ctx.body = ctx.render('page-person', {state: JSON.stringify(ctx.state)});
};