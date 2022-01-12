export default async function (ctx, next) {
    ctx.body = ctx.render('page-church', { state: JSON.stringify(ctx.state) });
};