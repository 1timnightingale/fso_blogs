const Notification = (message) => {
  if (message.message === null) {
    return <div className="">
      {message.message}
    </div>
  } else {
    return (
      <div className={message.status}>
        {message.message}
      </div>
    )
  }
}
export default Notification