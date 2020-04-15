const { resolve } = require('path')
const { Plugin } = require('powercord/entities')
const { getModule, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

const Badge = require('./components/Badge')
const Settings = require('./components/Settings')

module.exports = class MentionCount extends Plugin {
    async startPlugin() {
        this.registerSettings('mention-count', 'Mention Count', Settings)
        this.loadCSS(resolve(__dirname, 'style.css'))

        const { getTotalMentionCount: gm } = await getModule(['getGuildUnreadCount'])
        const { listItem } = await getModule(['guildSeparator', 'listItem'])
        const dispatcher = await getModule(['dispatch'])
        const { DefaultHomeButton } = await getModule(['DefaultHomeButton'])
        const { NumberBadge } = await getModule(['NumberBadge'])

        let homebtn, last = 0, _this = this

        inject('mention-count', DefaultHomeButton.prototype, 'render', function (_, res) {
            if (!homebtn) homebtn = this
            const d = _this.settings.get('display', 0)

            console.log(res)
            try {
                const { props } = res.props.children.props.children.props.children.props.children[1]
                const { props: props2 } = props.children
                let count = gm()
                last = count
                if ((!d || d == 1) && count == 0) return res
                switch (d) {
                    case 0:
                        if (props2.lowerBadge) count += props2.lowerBadge.props.count
                        props2.lowerBadge = React.createElement(
                            _this.settings.get('customBadge', true) ? Badge : NumberBadge, { count }
                        )
                        break
                    case 1:
                        props.text = `${count} Mention${count > 1 ? 's' : ''}`
                        break
                    default:
                        res = [ res, React.createElement('div', { className: listItem + ' mention-count' }, count) ]
                }
            } catch (e) {
                console.error(e)
            }

            return res
        })

        dispatcher.subscribe('MESSAGE_CREATE', this.updateBadge = () => {
            const d = this.settings.get('display', 0)
            if ((!d || d == 2) && homebtn && last != gm()) homebtn.forceUpdate()
        })
    }

    async pluginWillUnload() {
        uninject('mention-count')
        if (this.updateBadge) {
            const dispatcher = await getModule(['dispatch'])
            dispatcher.unsubscribe('MESSAGE_CREATE', this.updateBadge)
        }
    }
}
