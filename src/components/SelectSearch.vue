<template>
	<div class="vue-dropdown">
		<div class="cur-name" @click="curNameClickEvent">
            <span :class="{'spanStyle': current == '请选择医院'}">{{current}}</span>
            <van-icon :name="isShow ? 'arrow-down':'arrow-up'" size="16" />
        </div>
		<div class="list-and-search" :class="isShow?'on':''">
			<div class="search-module clearfix" v-show="isNeedSearch">
				<input class="search-text" @input='search' :value="searchValue" :placeholder="placeholder" />
                <van-icon name="search" size="18" />
			</div>
			<ul class="list-module">
				<li v-for ="(item,index) in datalist" @click="clickItem(item)" :key="index">
					<span class="list-item-text">{{item.text}}</span>
				</li>
			</ul>
			<div class="tip-nodata" v-show="searchValue.length && !datalist.length">暂无数据!</div>
		</div>
	</div>
</template>
 
<script>
 export default {
  name: 'SelectSearch',
  data(){
		return {
			searchValue: '',
			current: '',
			datalist:[],
			isShow:false
		}
  },
  props:{
		curData:String | Number | null,	// 当前选中数据
		itemData:Array,	// 所有选项数据
		isNeedSearch:{	// 是否需要搜索
			type: Boolean,
			default: true
		},
		placeholder:{	// 输入框提示文本
			type: String,
			default: '搜索' 
		},
  },

  watch: {
    curData: {
        handler: function(newVal, oldVal) {
           this.current = this.datalist.filter((item) => { return item.value == newVal})[0]['text'];
        },
        deep: true,
		immediate: true
    },
	itemData: {
        handler: function(newVal, oldVal) {
           this.datalist = newVal
        },
        deep: true,
		immediate: true
    }
  },
  
  created(){
	  console.log('值',this.curData,this.itemData);
		this.datalist = this.itemData;
        this.current = this.datalist.filter((item) => { return item.value == this.curData})[0]['text'];
		//点击组件以外的地方，收起
		document.addEventListener('click', (e) => {
			if (!this.$el.contains(e.target)){
				this.isShow = false
			}
		}, false)
  },
  methods:{
        curNameClickEvent () {
            this.isShow = !this.isShow;
            if (this.isShow) {
                this.searchValue = '';
                this.datalist = this.itemData
            }
        },

		search(e){
			this.searchValue = e.target.value;
			this.datalist = this.itemData.filter((item)=>{
				return item.text.indexOf(this.searchValue) != -1;
			});
		},
        
		clickItem(item){
			this.current = this.datalist.filter((innerItem) => { return innerItem.value == item.value})[0]['text'];
			this.isShow = false;
			this.$emit('change',item)
		},

		//供父组件调用的清除选择框值的方法
		clearSelectValue () {
			this.current = this.datalist[0]['text'];
			this.$emit('change',{text:this.datalist[0]['text'],value: null})
		}
	}
}
</script>
 
<style scoped lang="less">
    @import "~@/common/stylus/variable.less";
    @import "~@/common/stylus/mixin.less";
    @import "~@/common/stylus/modifyUi.less";
	.vue-dropdown {
		width: 100%;
		border-radius:3px; 
		border: 1px solid #ccc;
        background: #fff;
		cursor: pointer;
        box-sizing: border-box;
		user-select:none;
		-webkit-user-select:none; 
		position: relative;
		&._self-show {
			display: block!important;
		}
		.search-module {
			position: relative;
			border-bottom: 1px solid #ccc;
            box-sizing: border-box;
			.search-text {
				width: 100%;
				height: 30px;
				padding: 0 10px;
				box-shadow: none;
				outline: none;
                box-sizing: border-box;
				border: none;
			}
			/deep/ .van-icon {
				position: absolute;
				top: 50%;
				right: 6px;
                transform: translateY(-50%);
			}
		}
		input::-webkit-input-placeholder{
			font-size: 14px;
		}
		.list-module {
		 max-height: 200px;
		 overflow-y: auto;
			li {
                word-break: break-all;
                line-height: 16px;
				&._self-hide {
					display: none;
				}
				padding: 10px;
				&:hover {
					cursor:pointer;
					color: #fff;
					background: #00a0e9;
				}
			}
		}
	}
	.list-and-search{
		display: none;
		z-index: 100;
		background: #fff;
		border: 1px solid #ccc;
		position: absolute;
        box-sizing: border-box;
		width: 100%;
		&.on{
			display: block;
            margin-top: 4px
		}
	}
	.cur-name{
		height: 32px;
		line-height: 32px;
		padding: 0 10px;
		position: relative;
		color: #777;
        display: flex;
        >span {
            flex: 1;
            padding-right: 8px;
            box-sizing: border-box;
            .no-wrap()
        };
		.spanStyle {
			color: #dadada !important
		};
        /deep/ .van-icon {
            position: relative;
        };
        /deep/ .van-icon::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%)
        };
		// &:after{
		// 	position: absolute;
		// 	right: 9px;
		// 	top: 13px;
		// 	content: " ";
		// 	width: 0;
		// 	height: 0;
		// 	border-right: 6px solid transparent;
		// 	border-top: 6px solid #7b7b7b;
		// 	border-left: 6px solid transparent;
		// 	border-bottom: 6px solid transparent;
		// }
		// &.show{
		// 	&:after{
		// 		right: 9px;
		// 		top: 6px;
		// 		border-right: 6px solid transparent;
		// 		border-bottom: 6px solid #7b7b7b;
		// 		border-left: 6px solid transparent;
		// 		border-top: 6px solid transparent;
		// 	}
		// }
	}
	.tip-nodata {
		font-size: 14px;
		padding: 10px;
	}
</style>