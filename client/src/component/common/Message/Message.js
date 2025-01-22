function Message(props) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{minHeight: "90vh"}}>
            <h1>{props.headline}</h1>
            <h6>{props.message}</h6>
        </div>
    )
}

export default Message;