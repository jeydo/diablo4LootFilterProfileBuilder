let itemTypes = ['helm', 'chest armor', 'pants', 'gloves', 'boots', 'ring', 'amulet', 'axe', 'tow-handed axe', 'sword', 'two-handed sword', 'mace', 'two-handed mace', 'scythe', 'two-handed scythe', 'bow', 'bracers', 'crossbow', 'dagger', 'polarm', 'shield', 'staff', 'wand', 'offhand', 'totem'],
    affixes,
    aspects;
fetch('./affixes.json').then((response) => response.json()).then((json) => affixes = json);
fetch('./aspects.json').then((response) => response.json()).then((json) => aspects = json);
/*affixes = {
    "all_stats": "all stats",
    "dexterity": "dexterity",
    "energy_on_kill": "energy on kill",
    "essence_on_kill": "essence on kill",
    "fury_on_kill": "fury on kill"
};
*/
document.addEventListener('alpine:init', () => {
    Alpine.data('d4data', () => ({
        itemTypes : itemTypes,
        affixes : affixes,
        aspects : aspects,
        myList : [],
        init() {
            this.myList = this.getMyList();
            this.triggerSlimSelect();
            //console.log(this.myList);
            //this.clearItems();
        },
        getMyList() {
            let myList = localStorage.getItem('myList');
            if (myList) {
                return JSON.parse(myList);
            }
            return [];
        },
        buildNewItem() {
            return {
                id: new Date().getTime(),
                name : '',
                itemType : [],
                minPower : 780,
                affixPools : [],
                minAffixCount : 3
            }
        },
        removeItem(key) {
            this.myList.splice(key, 1);
            this.saveList();
        },
        clearItems() {
            this.myList = [];
            this.saveList();
        },
        saveList() {
            localStorage.setItem('myList', JSON.stringify(this.myList));
            console.log(this.myList);
        },
        addNewItem() {
            let newItem = this.buildNewItem();
            this.myList.push(newItem);
            this.saveList();
            this.triggerSlimSelect();
        },
        triggerSlimSelect() {
            this.$nextTick(() => {
                document.querySelectorAll('select').forEach((select) => {
                    if (select.classList.contains('slimselect')) {
                        return;
                    }
                    this.setSlimSelect(select, select.attributes.placeholder.value);
                });
            });
        },
        setSlimSelect(key, placeholder) {
            new SlimSelect({ select: key, settings: { placeholderText: placeholder }});
            key.classList.add('slimselect');
        },
        addAffix(key) {
            this.myList[key].affixPools.push({
                affix: '',
                value: ''
            });
            this.triggerSlimSelect();
        },
        removeAffix(key, affixKey) {
            this.myList[key].affixPools.splice(affixKey, 1);
        },
        contentFile() {
            let content = "Affixes:\n";
            for (const item of this.myList) {
                content += "  - " + item.name + "\n";
                content += "      ItemType: [" + item.itemType.join(', ') + "]\n";
                content += "      minPower: " + item.minPower + "\n";
                content += "      affixPools:\n";
                for (const affix of item.affixPools) {
                    content += "        - [" + affix.affix + (affix.value ? ', ' + affix.value : '') + "]\n";
                }
                content += "      minAffixCount: " + item.minAffixCount + "\n";
                content += "\n";
            }
            return content;
        }
    }));
});