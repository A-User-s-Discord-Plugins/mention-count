const { React } = require('@vizality/webpack')
const { RadioGroup, SwitchItem } = require('@vizality/components/settings')

module.exports = class Settings extends React.PureComponent {
    render() {
        return <>
            <RadioGroup
                options={[
                    { name: 'Home badge', value: 0 },
                    { name: 'Home tooltip', value: 1 },
                    { name: 'Text like online friends count', value: 2 }
                ]}
                value={this.props.getSetting('display', 0)}
                onChange={e => this.props.updateSetting('display', e.value)}
            >Display method</RadioGroup>
            <SwitchItem
                value={ this.props.getSetting('customBadge', true) }
                onChange={ () => {
                    this.props.toggleSetting('customBadge', true)
                    if (this.props.getSetting('fixBadges')) this.toggleFixBadges()
                }}
                note='This setting will increase the 1k+ limit for the Home badge to 99k+'
            >Show more than 1k+</SwitchItem>
            <SwitchItem
                value={this.props.getSetting('fixBadges') && this.props.getSetting('customBadge', true) }
                onChange={ () => this.toggleFixBadges() }
                disabled={ !this.props.getSetting('customBadge', true) }
            >Also show more than 1k+ for server pings</SwitchItem>
        </>
    }

    toggleFixBadges() {
        this.props.toggleSetting('fixBadges')
    }
}
