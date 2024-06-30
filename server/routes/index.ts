export default cachedEventHandler(async () => {
  return 'hi'
}, {
  // 10 mins
  maxAge: 60 * 10,
})
