import { Emitter } from '../../base/common';
import userCtrl from '../setting';
import { INullSpeciesItem, DomainTypes, emitter, loadSpeciesTree } from '../../core/';

/**
 * 物的控制器
 */
class ThingController extends Emitter {
  private species: INullSpeciesItem;
  constructor() {
    super();
    emitter.subscribePart([DomainTypes.Company], () => {
      setTimeout(async () => {
        await this.loadTeamSpecies();
      }, 100);
    });
  }
  /** 加载组织分类 */
  public async loadTeamSpecies(_reload: boolean = false): Promise<INullSpeciesItem> {
    if (this.species == undefined || _reload) {
      this.species = await loadSpeciesTree(userCtrl.space.id);
    }
    this.changCallback();
    return this.species;
  }
}

export default new ThingController();
