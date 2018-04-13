export default function Watcher (update) {
  /**
   * 监视器，通过get添加到dep
   *
   * @param {Function} update
   */

  this.update = update
  Watcher.tmp = this
  this.update()
  //Watcher.tmp = null
}

