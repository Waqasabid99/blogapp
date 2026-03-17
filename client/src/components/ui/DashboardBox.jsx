import React from 'react'

const DashboardBox = ({
    title,
    description,
    button,
    className,
    children
}) => {
    return (
        <section className={`p-6 rounded-lg flex justify-between items-center bg-(--bg-tertiary) ${className}`}>
            <header>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </header>
            <div className="mt-6">
                {button}
            </div>
            {children}
        </section>
    )
}

export default DashboardBox