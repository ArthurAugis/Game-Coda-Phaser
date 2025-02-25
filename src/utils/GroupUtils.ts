export class GroupUtils {
    public static preallocateGroup(group: Phaser.GameObjects.Group, size: number) {

        if(group.getLength() >= size) { return; }

        const canBeDisabled = group.classType && typeof group.classType.prototype.disable === 'function';

        for (let i = 0; i < size; i++) {
            const groupItem = group.create();
            if(canBeDisabled) {
                groupItem.disable();
            }
        }
    }
}
