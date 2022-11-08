export default async function (ctx, next) {
    ctx.body = ctx.render('page-temple', { state: JSON.stringify(ctx.state) });
};