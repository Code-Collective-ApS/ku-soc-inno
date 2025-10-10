export async function waitABit(beginTime: number): Promise<void> {
  const minDelaySinceBeginMs = 864;
  const nowTime = new Date().getTime();
  const msPassed = nowTime - beginTime;
  const msMissing = minDelaySinceBeginMs - msPassed;
  if (msMissing > 0) {
    return new Promise((ok) => setTimeout(ok, msMissing));
  }
}
