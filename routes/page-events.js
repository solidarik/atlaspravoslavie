export default async function (ctx, next) {
    console.log('render page events' + JSON.stringify(ctx))
    ctx.body = ctx.render('page-events', { state: JSON.stringify(ctx.state) });
};
